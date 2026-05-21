import { supabaseAdmin } from '../config/supabase.js';
import { success, error, paginated } from '../utils/apiResponse.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { uploadPluginZip, deletePluginFiles } from '../services/storage.service.js';

export const getPlugins = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query;

    let query = supabaseAdmin
      .from('plugins')
      .select(`
        id, name, slug, short_desc, category, tags, current_version, price,
        thumbnail_url, download_count, status, created_at,
        developer:profiles!developer_id(id, name, business_name)
      `, { count: 'exact' })
      .eq('status', 'approved');

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_desc.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order(sort_by === 'name' ? 'name' : 'created_at', { ascending: sort_order === 'asc' })
      .range(from, to);

    const { data: plugins, count, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch plugins: ${queryError.message}`);
    }

    return paginated(res, plugins, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Get plugins error:', err);
    return error(res, 'Failed to fetch plugins', 500);
  }
};

export const getPluginById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plugin, error: fetchError } = await supabaseAdmin
      .from('plugins')
      .select(`
        *,
        developer:profiles!developer_id(id, name, business_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !plugin) {
      throw new NotFoundError('Plugin not found');
    }

    // Public can only see approved plugins, others need auth
    if (plugin.status !== 'approved' && !req.user) {
      throw new NotFoundError('Plugin not found');
    }

    return success(res, plugin);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Get plugin error:', err);
    return error(res, 'Failed to fetch plugin');
  }
};

export const getMyPlugins = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('plugins')
      .select(`
        id, name, slug, short_desc, category, current_version, price,
        thumbnail_url, download_count, status, created_at, updated_at
      `, { count: 'exact' })
      .eq('developer_id', req.user.id)
      .order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data: plugins, count, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch plugins: ${queryError.message}`);
    }

    return paginated(res, plugins, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('Get my plugins error:', err);
    return error(res, 'Failed to fetch plugins');
  }
};

export const createPlugin = async (req, res) => {
  try {
    const { name, slug, description, short_desc, category, price, tags } = req.body;

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('plugins')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return error(res, 'Plugin slug already exists', 409);
    }

    // Check subscription limit
    const [profileRes, countRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('subscription_plan, subscription_status, subscription_expiry').eq('id', req.user.id).single(),
      supabaseAdmin.from('plugins').select('id', { count: 'exact' }).eq('developer_id', req.user.id)
    ]);

    const profile = profileRes.data || { subscription_plan: 'free' };
    const pluginCount = countRes.count || 0;
    
    // Limits: free = 5, pro = 10, business = 20
    let limit = 5;
    if (profile.subscription_plan === 'pro') limit = 10;
    if (profile.subscription_plan === 'business') limit = 20;

    if (pluginCount >= limit) {
      return error(res, `You have reached your limit of ${limit} plugins on the ${profile.subscription_plan || 'free'} plan. Please upgrade your subscription to upload more plugins.`, 403);
    }

    const { data: plugin, error: insertError } = await supabaseAdmin
      .from('plugins')
      .insert({
        developer_id: req.user.id,
        name,
        slug,
        description,
        short_desc,
        category,
        price: parseFloat(price) || 0,
        tags: tags || [],
        status: 'pending',  // Always pending — admin must approve
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create plugin: ${insertError.message}`);
    }

    return success(res, plugin, 201);
  } catch (err) {
    console.error('Create plugin error:', err);
    return error(res, err.message || 'Failed to create plugin');
  }
};

export const updatePlugin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, short_desc, category, price, tags } = req.body;

    // Check ownership
    const { data: existing } = await supabaseAdmin
      .from('plugins')
      .select('developer_id, status')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Plugin not found');
    }

    if (existing.developer_id !== req.user.id) {
      throw new ForbiddenError('You do not own this plugin');
    }

    // Only allow updating specific fields (whitelist approach for security)
    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (description !== undefined) allowedUpdates.description = description;
    if (short_desc !== undefined) allowedUpdates.short_desc = short_desc;
    if (category !== undefined) allowedUpdates.category = category;
    if (price !== undefined) allowedUpdates.price = price;
    if (tags !== undefined) allowedUpdates.tags = tags;

    const { data: plugin, error: updateError } = await supabaseAdmin
      .from('plugins')
      .update(allowedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update plugin: ${updateError.message}`);
    }

    return success(res, plugin);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Update plugin error:', err);
    return error(res, 'Failed to update plugin');
  }
};

export const deletePlugin = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabaseAdmin
      .from('plugins')
      .select('developer_id, slug')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Plugin not found');
    }

    if (existing.developer_id !== req.user.id) {
      throw new ForbiddenError('You do not own this plugin');
    }

    // Delete all ZIP files from storage first
    try {
      await deletePluginFiles(req.user.id, existing.slug);
      console.log(`🗑️  Storage files deleted for plugin: ${existing.slug}`);
    } catch (storageErr) {
      // Log but don't block the DB delete
      console.warn('Storage cleanup warning:', storageErr.message);
    }

    // ── Step 2: Delete child records (avoid FK constraint failures) ──────────
    // 2a. Get license IDs for this plugin
    const { data: licenseRows } = await supabaseAdmin
      .from('licenses')
      .select('id')
      .eq('plugin_id', id);

    if (licenseRows && licenseRows.length > 0) {
      const licIds = licenseRows.map((l) => l.id);
      // 2b. Delete activations linked to those licenses
      const res2b = await supabaseAdmin.from('activations').delete().in('license_id', licIds);
      if (res2b.error) console.error('Delete activations error:', res2b.error);
    }

    // 2c. Delete orders (orders.license_id points to licenses, so orders must be deleted before licenses)
    const res2c = await supabaseAdmin.from('orders').delete().eq('plugin_id', id);
    if (res2c.error) console.error('Delete orders error:', res2c.error);

    // 2d. Delete licenses
    const res2d = await supabaseAdmin.from('licenses').delete().eq('plugin_id', id);
    if (res2d.error) console.error('Delete licenses error:', res2d.error);

    // 2e. Delete plugin_versions
    const res2e = await supabaseAdmin.from('plugin_versions').delete().eq('plugin_id', id);
    if (res2e.error) console.error('Delete plugin_versions error:', res2e.error);

    // ── Step 3: Delete the plugin itself ────────────────────────────────────
    const { error: deleteError } = await supabaseAdmin
      .from('plugins')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Final plugin delete error:', deleteError);
      throw new Error(`Failed to delete plugin: ${deleteError.message}`);
    }

    return success(res, { message: 'Plugin deleted successfully' });
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Delete plugin error:', err);
    return error(res, err.message || 'Failed to delete plugin');
  }
};

export const uploadVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { version, changelog } = req.body;
    const file = req.file;

    if (!file) {
      console.error('uploadVersion: no file received. Content-Type:', req.headers['content-type']);
      console.error('uploadVersion: body keys:', Object.keys(req.body));
      return error(res, 'No ZIP file provided. Make sure you are uploading a .zip file.');
    }

    const { data: plugin, error: fetchError } = await supabaseAdmin
      .from('plugins')
      .select('id, developer_id, slug, current_version')
      .eq('id', id)
      .single();

    if (fetchError || !plugin) {
      throw new NotFoundError('Plugin not found');
    }

    if (plugin.developer_id !== req.user.id) {
      throw new ForbiddenError('You do not own this plugin');
    }

    // Upload to storage (automatically injects license validation)
    const zipPath = await uploadPluginZip(
      req.user.id,
      plugin.slug,
      version,
      file.buffer,
      plugin.current_version // pass current version for injection
    );

    // Mark previous versions as not latest
    await supabaseAdmin
      .from('plugin_versions')
      .update({ is_latest: false })
      .eq('plugin_id', id)
      .eq('is_latest', true);

    // Insert new version
    const { data: newVersion, error: insertError } = await supabaseAdmin
      .from('plugin_versions')
      .insert({
        plugin_id: id,
        version,
        zip_path: zipPath,
        changelog: changelog || null,
        is_latest: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save version: ${insertError.message}`);
    }

    // Update plugin current version
    await supabaseAdmin
      .from('plugins')
      .update({ current_version: version })
      .eq('id', id);

    return success(res, newVersion, 201);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Upload version error:', err);
    return error(res, err.message || 'Failed to upload version');
  }
};

export const getVersions = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: plugin } = await supabaseAdmin
      .from('plugins')
      .select('developer_id')
      .eq('id', id)
      .single();

    if (!plugin) {
      throw new NotFoundError('Plugin not found');
    }

    if (plugin.developer_id !== req.user.id) {
      throw new ForbiddenError('You do not own this plugin');
    }

    const { data: versions, error: queryError } = await supabaseAdmin
      .from('plugin_versions')
      .select('*')
      .eq('plugin_id', id)
      .order('created_at', { ascending: false });

    if (queryError) {
      throw new Error(`Failed to fetch versions: ${queryError.message}`);
    }

    return success(res, versions);
  } catch (err) {
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return error(res, err.message, err.statusCode);
    }
    console.error('Get versions error:', err);
    return error(res, 'Failed to fetch versions');
  }
};
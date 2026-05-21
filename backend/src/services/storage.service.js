import { supabaseAdmin } from '../config/supabase.js';
import AdmZip from 'adm-zip';

const BUCKET_NAME = 'plugins';

// Bucket 'plugins' is pre-created in Supabase dashboard.
// listBuckets() requires service-role access that can hit RLS in some configs,
// so we skip the check and let the upload call surface any real errors.
const ensureStorageBucket = async () => {
  // no-op – bucket already exists
};

// ============================================================================
// PluginVault License Validation Code - Auto-injected into all plugins
// Generated per-call so CLIENT_URL is always the runtime production value.
// ============================================================================
const getLicenseCode = (pluginSlug, pluginVersion, targetPath) => {
  // Must use BACKEND_URL (Express server), NOT CLIENT_URL (Vite frontend).
  // The /api/wp/activate endpoint lives on the backend, not the React app.
  const apiBase = (process.env.BACKEND_URL || process.env.CLIENT_URL || 'https://pluginvault.com') + '/api/wp';
  const escapedSlug = String(pluginSlug).replace(/'/g, "\\'");
  const escapedVersion = String(pluginVersion).replace(/'/g, "\\'");
  // targetPath is like 'naili-megamenu/naili-megamenu.php'
  const escapedPath = String(targetPath).replace(/'/g, "\\'");

  return `
// ============================================================================
// PluginVault License Validation - Auto-injected by PluginVault.com
// DO NOT EDIT — this file is auto-generated
// ============================================================================

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

if ( ! class_exists( 'PluginVault_License_Validator_${escapedSlug.replace(/-/g, '_')}' ) ) {

    class PluginVault_License_Validator_${escapedSlug.replace(/-/g, '_')} {

        private $license_key    = '';
        private $activation_code = '';
        private $license_status = '';
        private $site_url       = '';
        private $option_prefix  = 'pv_${escapedSlug.replace(/-/g, '_')}_';

        public function __construct() {
            $this->license_key     = get_option( $this->option_prefix . 'license_key', '' );
            $this->activation_code = get_option( $this->option_prefix . 'activation_code', '' );
            $this->license_status  = get_option( $this->option_prefix . 'license_status', '' );
            $this->site_url        = get_site_url();

            add_action( 'admin_post_pv_${escapedSlug.replace(/-/g, '_')}_activate', array( $this, 'validate_license' ) );
            add_action( 'admin_notices',                                    array( $this, 'show_admin_notices' ), 1 ); // priority 1 to render early
        }

        public function license_page() {
            $is_activated = ( $this->license_status === 'valid' );
            $pfx          = $this->option_prefix;
            ?>
            <div class="wrap pv-license-wrap">
                <h1>PluginVault — License Activation</h1>
                <p style="color:#666;">Plugin: <strong><?php echo esc_html( '${escapedSlug}' ); ?></strong></p>

                <?php if ( $is_activated ) : ?>

                <div class="notice notice-success notice-alt" style="padding:15px 20px;margin:10px 0;">
                    <h2 style="margin:0 0 8px 0;">✅ Plugin Licensed</h2>
                    <p style="margin:0;">Your plugin is activated and ready to use.</p>
                    <p style="margin:8px 0 0;"><strong>License Key:</strong> <code><?php echo esc_html( $this->license_key ); ?></code></p>
                    <p style="margin:4px 0 0;"><strong>Site:</strong> <?php echo esc_html( $this->site_url ); ?></p>
                </div>

                <?php else : ?>

                <div class="notice notice-info notice-alt" style="padding:15px 20px;margin:10px 0;">
                    <p><strong>How to activate:</strong><br>
                    Copy the <strong>Plugin Activation Key</strong> from your
                    <a href="https://pluginvault.com/customer/licenses" target="_blank">PluginVault account</a>
                    and paste it below. The key can only be used once.</p>
                </div>

                <?php if ( isset( $_GET['pv_msg'] ) ) :
                    $msg_map = array(
                        'missing' => array( 'Please enter your activation key.', 'notice-warning' ),
                        'invalid' => array( 'Invalid key or activation code. Check your PluginVault portal.', 'notice-error' ),
                        'error'   => array( 'Could not reach the license server. Please try again later.', 'notice-warning' ),
                        'success' => array( 'License activated successfully!', 'notice-success' ),
                    );
                    $pv_msg   = sanitize_key( $_GET['pv_msg'] );
                    if ( isset( $msg_map[ $pv_msg ] ) ) : ?>
                        <div class="notice <?php echo esc_attr( $msg_map[ $pv_msg ][1] ); ?> is-dismissible">
                            <p><?php echo esc_html( $msg_map[ $pv_msg ][0] ); ?></p>
                        </div>
                    <?php endif;
                endif; ?>

                <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                    <input type="hidden" name="action" value="pv_${escapedSlug.replace(/-/g, '_')}_activate">
                    <?php wp_nonce_field( 'pv_${escapedSlug.replace(/-/g, '_')}_activate_nonce' ); ?>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="pv_activation_key">Plugin Activation Key</label></th>
                            <td>
                                <input type="text"
                                       id="pv_activation_key"
                                       name="pv_activation_key"
                                       placeholder="PVLT-XXXX-XXXX-XXXX-XXXX::XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                       style="width:520px;font-family:monospace;font-size:13px;"
                                       class="regular-text">
                                <p class="description">
                                    Paste the full <strong>Plugin Activation Key</strong> from your PluginVault portal
                                    (format: <code>PVLT-XXXX-XXXX-XXXX-XXXX::ACTIVATION_CODE</code>).
                                </p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button( 'Activate Plugin' ); ?>
                </form>

                <?php endif; ?>
            </div>
            <?php
        }

        public function validate_license() {
            if ( ! current_user_can( 'manage_options' ) ||
                 ! wp_verify_nonce( $_POST['_wpnonce'] ?? '', 'pv_${escapedSlug.replace(/-/g, '_')}_activate_nonce' ) ) {
                wp_die( 'Unauthorized' );
            }

            $raw = sanitize_text_field( $_POST['pv_activation_key'] ?? '' );

            // Accept combined format: PVLT-XXXX::ACTIVATION_CODE
            if ( strpos( $raw, '::' ) !== false ) {
                list( $license_key, $activation_code ) = explode( '::', $raw, 2 );
                $license_key     = trim( $license_key );
                $activation_code = trim( $activation_code );
            } else {
                $license_key     = $raw;
                $activation_code = sanitize_text_field( $_POST['pv_activation_code'] ?? '' );
            }

            $pfx = $this->option_prefix;
            update_option( $pfx . 'license_key',     $license_key );
            update_option( $pfx . 'activation_code', $activation_code );

            // Redirect back to the same page
            $redirect = remove_query_arg( 'pv_msg', wp_get_referer() ?: admin_url( 'admin.php?page=${escapedSlug}' ) );

            if ( empty( $license_key ) || empty( $activation_code ) ) {
                update_option( $pfx . 'license_status', '' );
                wp_safe_redirect( add_query_arg( 'pv_msg', 'missing', $redirect ) );
                exit;
            }

            $response = wp_remote_post( '${apiBase}/activate', array(
                'timeout' => 20,
                'body'    => array(
                    'license_key'     => $license_key,
                    'activation_code' => $activation_code,
                    'site_url'        => $this->site_url,
                    'plugin_slug'     => '${escapedSlug}',
                    'plugin_version'  => '${escapedVersion}',
                ),
            ) );

            if ( is_wp_error( $response ) ) {
                update_option( $pfx . 'license_status', 'error' );
                wp_safe_redirect( add_query_arg( 'pv_msg', 'error', $redirect ) );
                exit;
            }

            $result = json_decode( wp_remote_retrieve_body( $response ), true );

            // Express 'success(res, data)' wrapper returns { success: true, data: { is_valid: true } }
            $is_valid = !empty($result['success']) && !empty($result['data']['is_valid']);

            if ( $is_valid ) {
                update_option( $pfx . 'license_status', 'valid' );
                wp_safe_redirect( add_query_arg( 'pv_msg', 'success', $redirect ) );
            } else {
                update_option( $pfx . 'license_status', 'invalid' );
                wp_safe_redirect( add_query_arg( 'pv_msg', 'invalid', $redirect ) );
            }
            exit;
        }

        public function show_admin_notices() {
            if ( $this->license_status === 'valid' ) return;

            $page = sanitize_text_field( $_GET['page'] ?? '' );
            $is_plugin_page = ( strpos( $page, '${escapedSlug}' ) !== false );

            if ( $is_plugin_page ) {
                // We are ON the plugin's own admin page.
                // Output CSS to hide the plugin's actual features and show our form instead.
                echo '<style>#wpbody-content .wrap:not(.pv-license-wrap) { display: none !important; }</style>';
                $this->license_page();
            } else {
                // Show a persistent banner on other admin pages until the license is activated
                // We point the link to the plugin's own page since that's where the form is now rendered
                $page_url = admin_url( 'admin.php?page=${escapedSlug}' );
                ?>
                <div class="notice notice-warning" style="border-left-color:#f0a500;">
                    <p>
                        <strong>PluginVault — License Required:</strong>
                        Please <a href="<?php echo esc_url( $page_url ); ?>"><strong>activate your license</strong></a>
                        to unlock the full features of <strong><?php echo esc_html( '${escapedSlug}' ); ?></strong>.
                    </p>
                </div>
                <?php
            }
        }

        public function is_licensed() {
            return $this->license_status === 'valid';
        }
    }

    // Hook into plugins_loaded so WordPress functions are available
    add_action( 'plugins_loaded', function() {
        $GLOBALS['pv_license_${escapedSlug.replace(/-/g, '_')}'] = new PluginVault_License_Validator_${escapedSlug.replace(/-/g, '_')}();
    } );

} // end class_exists check
`;
};


/**
 * Find the main plugin file in a ZIP archive
 */
const findMainPluginFile = (entries) => {
  let mainFile = null;
  let mainPath = null;

  // Priority 1: Look for file with "Plugin Name:" header in root
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const name = entry.entryName.toLowerCase();
    if (name.endsWith('.php') && name.split('/').length <= 2) {
      const content = entry.getData().toString('utf8');
      if (content.includes('Plugin Name:')) {
        return { entry, path: entry.entryName };
      }
    }
  }

  // Priority 2: Look for {slug}.php or {slug}/{slug}.php
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const name = entry.entryName.toLowerCase();
    if (name.endsWith('plugin.php') || name.includes('-plugin.php')) {
      return { entry, path: entry.entryName };
    }
  }

  // Priority 3: First PHP file in root
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const name = entry.entryName.toLowerCase();
    const parts = name.split('/');
    if (parts.length === 2 && parts[1].endsWith('.php')) {
      return { entry, path: entry.entryName };
    }
  }

  // Priority 4: Any PHP file
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    if (entry.entryName.endsWith('.php')) {
      return { entry, path: entry.entryName };
    }
  }

  return null;
};

/**
 * Inject license validation into a plugin ZIP buffer.
 *
 * Safe approach: instead of heavily modifying the main plugin PHP file
 * (which can corrupt the file due to encoding or structure issues), we:
 *  1. Add a SINGLE `require_once` line at the end of the main PHP file
 *  2. Place ALL license logic in a separate `pluginvault-license.php` file
 *
 * This preserves the Plugin Name: header and avoids encoding corruption.
 */
const injectLicenseIntoZip = (zipBuffer, pluginSlug, pluginVersion) => {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  const mainFileInfo = findMainPluginFile(entries);
  if (!mainFileInfo) {
    throw new Error('Could not find main plugin file in ZIP');
  }

  const { entry: targetEntry, path: targetPath } = mainFileInfo;

  // Determine directory prefix so the license file goes in the same folder
  // e.g. targetPath = 'my-plugin/my-plugin.php' → dirPrefix = 'my-plugin/'
  const parts = targetPath.split('/');
  const dirPrefix = parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';
  const licenseFileName = 'pluginvault-license.php';
  const licenseFilePath = dirPrefix + licenseFileName;

  // ── Step 1: Minimally modify the main PHP file ──────────────────────────
  // Read as latin1 to preserve every byte exactly (avoids utf8 mojibake)
  const originalData = targetEntry.getData();
  let mainContent = originalData.toString('latin1');

  // Only add require_once if not already injected
  if (!mainContent.includes('pluginvault-license.php')) {
    // IMPORTANT: We only require the license file — we do NOT add a return/exit
    // block here. Blocking the entire plugin (with return;) kills all of its
    // hooks, menus, and admin pages, making the plugin completely non-functional.
    // Instead, the license validator class (in pluginvault-license.php) registers
    // an admin notice banner that prompts the user to activate their license.
    // The plugin itself continues to load and work normally.
    const requireLine = `
// --- PluginVault License Validation (auto-injected by PluginVault.com) ---
require_once dirname( __FILE__ ) . '/${licenseFileName}';
// ---------------------------------------------------------------------------
`;

    // Inject right after the first <?php tag
    if (mainContent.match(/<\?php/i)) {
      mainContent = mainContent.replace(/<\?php/i, `<?php\n${requireLine}`);
    } else {
      // Fallback if no <?php tag is found (unlikely for a WP plugin)
      mainContent = `<?php\n${requireLine}\n?>\n` + mainContent;
    }

    // Write back using latin1 to preserve the original bytes faithfully
    targetEntry.setData(Buffer.from(mainContent, 'latin1'));
  }

  // ── Step 2: Create the separate license PHP file ─────────────────────────
  // All complex license code lives here — isolated from the main plugin file
  const licenseCode = getLicenseCode(pluginSlug, pluginVersion, targetPath);
  const licensePhpContent = `<?php\n// PluginVault License Validation — auto-generated. Do not edit.\n${licenseCode}\n`;

  // Remove old license file if it exists, then re-add fresh
  try { zip.deleteFile(licenseFilePath); } catch (_) { /* ok if not there */ }
  zip.addFile(licenseFilePath, Buffer.from(licensePhpContent, 'utf8'));

  // ── Step 3: Add PluginVault metadata file ────────────────────────────────
  const pluginInfo = {
    platform: 'PluginVault',
    version: '2.0',
    injected_at: new Date().toISOString(),
    plugin_slug: pluginSlug,
    plugin_version: pluginVersion,
    main_file: targetPath,
    license_file: licenseFilePath,
  };
  try { zip.deleteFile(dirPrefix + 'pluginvault-info.json'); } catch (_) { /* ok */ }
  zip.addFile(dirPrefix + 'pluginvault-info.json', Buffer.from(JSON.stringify(pluginInfo, null, 2)));

  return zip.toBuffer();
};

export const uploadPluginZip = async (developerId, pluginSlug, version, buffer, pluginVersion) => {
  // Ensure the storage bucket exists before attempting upload
  await ensureStorageBucket();

  // Inject license validation into the plugin ZIP
  let processedBuffer;
  try {
    // Use the current version or the new version as fallback
    const versionForInjection = pluginVersion || version || '1.0.0';
    processedBuffer = injectLicenseIntoZip(buffer, pluginSlug, versionForInjection);
    console.log(`✅ License validation injected for plugin: ${pluginSlug} v${version}`);
  } catch (err) {
    console.error(`⚠️  License injection failed for ${pluginSlug}, uploading original:`, err.message);
    processedBuffer = buffer;
  }

  const path = `${developerId}/${pluginSlug}/${version}.zip`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, processedBuffer, {
      contentType: 'application/zip',
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  console.log(`📦 Plugin stored at: ${path}`);
  return path;
};

export const getSignedDownloadUrl = async (zipPath, expiresIn = 60) => {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(zipPath, expiresIn);

  if (error) {
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }

  return data.signedUrl;
};

export const deletePluginFiles = async (developerId, pluginSlug) => {
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(`${developerId}/${pluginSlug}`);

  if (listError) {
    throw new Error(`Failed to list plugin files: ${listError.message}`);
  }

  if (files && files.length > 0) {
    const pathsToDelete = files.map((f) => `${developerId}/${pluginSlug}/${f.name}`);
    const { error: deleteError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove(pathsToDelete);

    if (deleteError) {
      throw new Error(`Failed to delete plugin files: ${deleteError.message}`);
    }
  }
};
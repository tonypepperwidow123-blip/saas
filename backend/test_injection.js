import AdmZip from 'adm-zip';
import dotenv from 'dotenv';
dotenv.config();

// Define the exact getLicenseCode used in our storage service
const getLicenseCode = (pluginSlug, pluginVersion, targetPath) => {
  const apiBase = (process.env.CLIENT_URL || 'https://pluginvault.com') + '/api/wp';
  const escapedSlug = String(pluginSlug).replace(/'/g, "\\'");
  const escapedVersion = String(pluginVersion).replace(/'/g, "\\'");

  return `
// ============================================================================
// PluginVault License Validation - One-Time Activation
// Platform: PluginVault.com | Version: auto-injected
// IMPORTANT: Activation code can only be used ONCE
// ============================================================================

if (!defined('PLUGINVAULT_LICENSED')) {
    define('PLUGINVAULT_LICENSE_API', '${apiBase}');
    define('PLUGINVAULT_PLUGIN_SLUG', '${escapedSlug}');
    define('PLUGINVAULT_PLUGIN_VERSION', '${escapedVersion}');

    class PluginVault_License_Validator {
        private $license_key = '';
        private $activation_code = '';
        private $license_status = '';
        private $site_url = '';

        public function __construct() {
            $this->license_key = get_option('pluginvault_license_key', '');
            $this->activation_code = get_option('pluginvault_activation_code', '');
            $this->license_status = get_option('pluginvault_license_status', '');
            $this->site_url = get_site_url();

            add_action('admin_menu', array($this, 'add_license_menu'));
            add_action('admin_post_pluginvault_validate_license', array($this, 'validate_license'));
            add_action('admin_notices', array($this, 'show_admin_notices'));
        }

        public function add_license_menu() {
            add_options_page(
                'PluginVault License',
                'Plugin License',
                'manage_options',
                'pluginvault-license',
                array($this, 'license_page')
            );
        }

        public function license_page() {
            $is_activated = $this->license_status === 'valid';
            ?>
            <div class="wrap">
                <h1>PluginVault License Activation</h1>
                <p>Status: <?php echo $is_activated ? "Activated" : "Not Activated"; ?></p>
            </div>
            <?php
        }
        
        public function validate_license() {}
        public function show_admin_notices() {}
    }

    $pv_license = new PluginVault_License_Validator();
    define('PLUGINVAULT_LICENSED', true);
}
`;
};

// Replicate the injectLicenseIntoZip logic to verify
function testInjection() {
    console.log('📦 Creating dummy WordPress plugin ZIP...');
    const zip = new AdmZip();
    
    // Create a dummy PHP file that simulates a WordPress plugin
    const dummyPhpContent = `<?php
/**
 * Plugin Name: Kanjivaram Theme Helper
 * Description: A sample plugin to verify PHP injection.
 * Version: 1.0.0
 * Author: Test Developer
 */

function kanjivaram_init() {
    // Plugin logic here
    echo "Kanjivaram Initialized";
}
add_action('init', 'kanjivaram_init');
?>`;
    
    zip.addFile('kanjivaram.php', Buffer.from(dummyPhpContent));
    const zipBuffer = zip.toBuffer();

    console.log('💉 Simulating Auto-Injection pipeline...');
    
    // --- INJECTION PIPELINE (same as storage.service.js) ---
    const processZip = new AdmZip(zipBuffer);
    const entry = processZip.getEntry('kanjivaram.php');
    
    const licenseCode = getLicenseCode('kanjivaram', '1.0.0', 'kanjivaram.php');
    let baseContent = entry.getData().toString('utf8').trimEnd();
    
    let updatedContent;
    if (baseContent.endsWith('?>')) {
        updatedContent = baseContent.slice(0, -2).trimEnd() + '\\n\\n<?php\\n' + licenseCode;
    } else {
        updatedContent = baseContent + '\\n\\n' + licenseCode;
    }
    
    entry.setData(Buffer.from(updatedContent, 'utf8'));
    
    // Add metadata
    processZip.addFile('pluginvault-info.json', Buffer.from(JSON.stringify({
        platform: 'PluginVault',
        injected_at: new Date().toISOString()
    }, null, 2)));
    // -------------------------------------------------------
    
    console.log('✅ Injection complete. Extracting modified PHP code for inspection:\\n');
    console.log('--------------------------------------------------');
    console.log(processZip.getEntry('kanjivaram.php').getData().toString('utf8'));
    console.log('--------------------------------------------------');
    
    console.log('\\n📁 Contents of the final ZIP archive:');
    processZip.getEntries().forEach(e => console.log(' - ' + e.entryName));
}

testInjection();

<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://profiles.wordpress.org/thundertix
 * @since             1.0.0
 * @package           Thundertix
 *
 * @wordpress-plugin
 * Plugin Name:       ThunderTix
 * Plugin URI:        https://wordpress.org/plugins/thundertix
 * Description:       The ThunderTix plugin allows you to integrate your public events in your own web page.
 * Version:           2020.12.29
 * Author:            Dawn Green
 * Author URI:        https://profiles.wordpress.org/thundertix
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       thundertix
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( "WPINC" ) ) {
  die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( "THUNDERTIX_VERSION", "2020.12.29" );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-thundertix-activator.php
 */
function activate_thundertix() {
  require_once plugin_dir_path( __FILE__ ) . 'includes/class-thundertix-activator.php';
  Thundertix_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-thundertix-deactivator.php
 */
function deactivate_thundertix() {
  require_once plugin_dir_path( __FILE__ ) . 'includes/class-thundertix-deactivator.php';
  Thundertix_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_thundertix' );
register_deactivation_hook( __FILE__, 'deactivate_thundertix' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-thundertix.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_thundertix() {

  $plugin = new Thundertix();
  $plugin->run();

}
run_thundertix();

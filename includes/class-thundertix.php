<?php

class Thundertix {

  /**
   * The loader that's responsible for maintaining and registering all hooks that power
   * the plugin.
   *
   * @since    1.0.0
   * @access   protected
   * @var      Thundertix_Loader    $loader    Maintains and registers all hooks for the plugin.
   */
  protected $loader;

  /**
   * The unique identifier of this plugin.
   *
   * @since    1.0.0
   * @access   protected
   * @var      string    $plugin_name    The string used to uniquely identify this plugin.
   */
  protected $plugin_name;

  /**
   * The current version of the plugin.
   *
   * @since    1.0.0
   * @access   protected
   * @var      string    $version    The current version of the plugin.
   */
  protected $version;

  /**
   * Define the core functionality of the plugin.
   *
   * Set the plugin name and the plugin version that can be used throughout the plugin.
   * Load the dependencies, define the locale, and set the hooks for the admin area and
   * the public-facing side of the site.
   *
   * @since    1.0.0
   */
  public function __construct() {
    if ( defined( 'THUNDERTIX_VERSION' ) ) {
      $this->version = THUNDERTIX_VERSION;
    } else {
      $this->version = '1.0.0';
    }
    $this->plugin_name = 'thundertix';

    $this->load_dependencies();
    $this->set_locale();
    $this->define_api_hooks();
    $this->define_commun_hooks();
    $this->define_admin_hooks();
    $this->define_public_hooks();
    $this->define_gutenberg_hooks();

  }

  /**
   * Load the required dependencies for this plugin.
   *
   * Include the following files that make up the plugin:
   *
   * - Thundertix_Loader. Orchestrates the hooks of the plugin.
   * - Thundertix_i18n. Defines internationalization functionality.
   * - Thundertix_Commun. Defines all hooks for the admin and public area.
   * - Thundertix_Admin. Defines all hooks for the admin area.
   * - Thundertix_Public. Defines all hooks for the public side of the site.
   * - Thundertix_Gutenberg. Defines all hooks for the gutenberg editor.
   *
   * Create an instance of the loader which will be used to register the hooks
   * with WordPress.
   *
   * @since    1.0.0
   * @access   private
   */
  private function load_dependencies() {

    /**
     * The class responsible for orchestrating the actions and filters of the
     * core plugin.
     */
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-thundertix-loader.php';

    /**
     * The class responsible for defining internationalization functionality
     * of the plugin.
     */
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-thundertix-i18n.php';

    /**
     * The class responsible for defining all actions that occur in the admin area.
     */
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'api/class-thundertix-api.php';

    /**
     * The class responsible for defining all actions that occur in the admin area.
     */
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'commun/class-thundertix-commun.php';

    /**
     * The class responsible for defining all actions that occur in the admin area.
     */
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-thundertix-admin.php';

    /**
     * The class responsible for defining all actions that occur in the public-facing
     * side of the site.
     */
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-thundertix-public.php';

    /**
     * The class responsible for defining all actions that occur in the gutenberg-editor
     * side of the site.
     */
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'gutenberg/class-thundertix-gutenberg.php';

    $this->loader = new Thundertix_Loader();

  }

  /**
   * Define the locale for this plugin for internationalization.
   *
   * Uses the Thundertix_i18n class in order to set the domain and to register the hook
   * with WordPress.
   *
   * @since    1.0.0
   * @access   private
   */
  private function set_locale() {

    $plugin_i18n = new Thundertix_i18n();

    $this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

  }

  /**
   * Register all of the hooks related to the commun area functionality
   * of the plugin.
   *
   * @since    1.0.7
   * @access   private
   */
  private function define_api_hooks() {
    $plugin_api = new Thundertix_Api( $this->get_plugin_name(), $this->get_version() );

    $this->loader->add_action( 'rest_api_init', $plugin_api, 'thundertix_api_register_routes' );
  }

  /**
   * Register all of the hooks related to the commun area functionality
   * of the plugin.
   *
   * @since    1.0.7
   * @access   private
   */
  private function define_commun_hooks() {

    $plugin_commun = new Thundertix_Commun( $this->get_plugin_name(), $this->get_version() );

    $this->loader->add_action( 'admin_enqueue_scripts', $plugin_commun, 'enqueue_thundertix_commun_base_api' );
    $this->loader->add_action( 'wp_enqueue_scripts', $plugin_commun, 'enqueue_thundertix_commun_base_api' );

  }

  /**
   * Register all of the hooks related to the admin area functionality
   * of the plugin.
   *
   * @since    1.0.0
   * @access   private
   */
  private function define_admin_hooks() {

    $plugin_admin = new Thundertix_Admin( $this->get_plugin_name(), $this->get_version() );

    $this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
    $this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );

    $this->loader->add_action( 'admin_menu', $plugin_admin, 'add_options_page' );
    $this->loader->add_action( 'admin_init', $plugin_admin, 'register_setting' );

    $this->loader->add_filter( 'plugin_action_links_ttix_wordpress/thundertix.php', $plugin_admin, 'thundertix_add_settings_link' );

  }

  /**
   * Register all of the hooks related to the public-facing functionality
   * of the plugin.
   *
   * @since    1.0.0
   * @access   private
   */
  private function define_public_hooks() {

    $plugin_public = new Thundertix_Public( $this->get_plugin_name(), $this->get_version() );

    $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
    $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );
    $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_thundertix_embed' );

  }

  /**
   * Register all of the hooks related to Gutenberg
   *
   * Instance all class you have into GUTENBERG folder and add the objet to the loader,
   * and remember to 'require_once' into gutenberg class on the function: load_dependencies()
   * similar this
   *
   * @since  1.0.2
   * @access private
   */
  private function define_gutenberg_hooks() {
    $plugin_gutenberg = new Thundertix_Gutenberg( $this->get_plugin_name(), $this->get_version() );

    $this->loader->add_action( 'init', $plugin_gutenberg, 'thundertix_enqueue_blocks_assets' );
    $this->loader->add_filter( 'block_categories', $plugin_gutenberg, 'thundertix_add_block_category' );

    $this->loader->add_action( 'wp_enqueue_scripts', $plugin_gutenberg, 'thundertix_register_events_block');
  }

  /**
   * Run the loader to execute all of the hooks with WordPress.
   *
   * @since    1.0.0
   */
  public function run() {
    $this->loader->run();
  }

  /**
   * The name of the plugin used to uniquely identify it within the context of
   * WordPress and to define internationalization functionality.
   *
   * @since     1.0.0
   * @return    string    The name of the plugin.
   */
  public function get_plugin_name() {
    return $this->plugin_name;
  }

  /**
   * The reference to the class that orchestrates the hooks with the plugin.
   *
   * @since     1.0.0
   * @return    Thundertix_Loader    Orchestrates the hooks of the plugin.
   */
  public function get_loader() {
    return $this->loader;
  }

  /**
   * Retrieve the version number of the plugin.
   *
   * @since     1.0.0
   * @return    string    The version number of the plugin.
   */
  public function get_version() {
    return $this->version;
  }

}

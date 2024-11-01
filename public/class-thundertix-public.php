<?php

class Thundertix_Public {

  /**
   * The ID of this plugin.
   *
   * @since    1.0.0
   * @access   private
   * @var      string    $plugin_name    The ID of this plugin.
   */
  private $plugin_name;

  /**
   * The version of this plugin.
   *
   * @since    1.0.0
   * @access   private
   * @var      string    $version    The current version of this plugin.
   */
  private $version;

  /**
   * Initialize the class and set its properties.
   *
   * @since    1.0.0
   * @param      string    $plugin_name       The name of the plugin.
   * @param      string    $version    The version of this plugin.
   */
  public function __construct( $plugin_name, $version ) {

    $this->plugin_name = $plugin_name;
    $this->version = $version;

  }

  /**
   * Register the stylesheets for the public-facing side of the site.
   *
   * @since    1.0.0
   */
  public function enqueue_styles() {

    /**
     * This function is provided for demonstration purposes only.
     *
     * An instance of this class should be passed to the run() function
     * defined in Thundertix_Loader as all of the hooks are defined
     * in that particular class.
     *
     * The Thundertix_Loader will then create the relationship
     * between the defined hooks and the functions defined in this
     * class.
     */

    wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . "/css/thundertix-public.css", array(), $this->version, "all" );
    wp_enqueue_style( "{$this->plugin_name}-font-awesome", "//cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css", array(), "5.13.1" );
    wp_enqueue_style( "{$this->plugin_name}-events-block", plugin_dir_url( __FILE__ ) . "/css/thundertix-public-events-block.css", array(), $this->version, "all" );

  }

  /**
   * Register the JavaScript for the public-facing side of the site.
   *
   * @since    1.0.0
   */
  public function enqueue_scripts() {

    /**
     * This function is provided for demonstration purposes only.
     *
     * An instance of this class should be passed to the run() function
     * defined in Thundertix_Loader as all of the hooks are defined
     * in that particular class.
     *
     * The Thundertix_Loader will then create the relationship
     * between the defined hooks and the functions defined in this
     * class.
     */

    wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . '/js/thundertix-public.js', array( 'jquery' ), $this->version, false );
    wp_enqueue_script( "{$this->plugin_name}-polyfills", plugin_dir_url( __FILE__ ) . '/js/thundertix-public-polyfills.js', array(), $this->version, false );
    wp_enqueue_script( "{$this->plugin_name}-events-block", plugin_dir_url( __FILE__ ) . '/js/thundertix-public-events-block.js', array(), time(), false );

  }

  /**
   * Add thundertix_embed to javascript
   *
   * @since  1.0.10
   */
  public function enqueue_thundertix_embed() {
    wp_enqueue_script(
      $this->plugin_name,
      plugin_dir_url( __FILE__ ) . 'js/thundertix-public-thundertix-embed.js',
      array(),
      $this->version,
      false
    );

    $data = get_option( 'thundertix_data' );
    wp_localize_script( $this->plugin_name, 'thundertix_embed', $data['embed'] );
  }
}

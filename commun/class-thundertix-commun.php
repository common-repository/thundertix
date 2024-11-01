<?php

class Thundertix_Commun {

  /**
   * The ID of this plugin.
   *
   * @since    1.0.7
   * @access   private
   * @var      string    $plugin_name    The ID of this plugin.
   */
  private $plugin_name;

  /**
   * The version of this plugin.
   *
   * @since    1.0.7
   * @access   private
   * @var      string    $version    The current version of this plugin.
   */
  private $version;

  /**
   * Initialize the class and set its properties.
   *
   * @since    1.0.7
   * @param      string    $plugin_name       The name of the plugin.
   * @param      string    $version    The version of this plugin.
   */
  public function __construct( $plugin_name, $version ) {

    $this->plugin_name = $plugin_name;
    $this->version = $version;

  }

  /**
   * Add thundertix_events_uri for javascript
   * and make a global variable in javascript
   *
   * @since  1.0.7
   */
  public function enqueue_thundertix_commun_base_api() {
    wp_enqueue_script(
      $this->plugin_name,
      plugin_dir_url( __FILE__ ) . 'js/thundertix-commun-base-api.js',
      array(),
      $this->version,
      false
    );

    $wp_json_url = str_replace( home_url(), site_url() . "/index.php", get_rest_url() );
    $thundertix_base_api = "{$wp_json_url}thundertix/v1";

    wp_localize_script( $this->plugin_name, 'thundertix_base_api', $thundertix_base_api );
  }

}

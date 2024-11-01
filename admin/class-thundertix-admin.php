<?php

class Thundertix_Admin {

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
   * @param      string    $plugin_name       The name of this plugin.
   * @param      string    $version    The version of this plugin.
   */
  public function __construct( $plugin_name, $version ) {

    $this->plugin_name = $plugin_name;
    $this->version = $version;

  }

  /**
   * Register the stylesheets for the admin area.
   *
   * @since    1.0.0
   */
  public function enqueue_styles() {

    wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . '/css/thundertix-admin.css', array(), $this->version, 'all' );

  }

  /**
   * Register the JavaScript for the admin area.
   *
   * @since    1.0.0
   */
  public function enqueue_scripts() {

    wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . '/js/thundertix-admin.js', array( 'jquery' ), $this->version, false );

  }

  /**
   * Add thundertix page under settings submenu
   *
   * @since  1.0.0
   */
  public function add_options_page() {
    $this->plugin_screen_hook_suffix = add_options_page(
      __('ThunderTix Settings', 'thundertix'),
      __('ThunderTix', 'thundertix'),
      'manage_options',
      $this->plugin_name,
      array($this, 'display_options_page')
    );
  }

  /**
   * Render thundertix page
   *
   * @since  1.0.0
   */
  public function display_options_page() {
    include_once 'partials/thundertix-admin-display.php';
  }

  /**
   * Register instructions section and token field
   *
   * @since  1.0.0
   */
  public function register_setting() {
    add_settings_section(
      "thundertix_instructions",
      __( 'Please, Follow the instructions below', 'thundertix' ),
      array( $this, "thundertix_instructions_cb" ),
      $this->plugin_name
    );

    add_settings_field(
      "thundertix_token",
      __( 'Token <span class="is_required">*</span>', 'thundertix' ),
      array( $this, "thundertix_token_cb" ),
      $this->plugin_name,
      "thundertix_instructions",
      array( 'label_for' => "thundertix_token" )
    );

    add_settings_field(
      "thundertix_subdomain",
      __( 'Subdomain <span class="is_required">*</span>', 'thundertix' ),
      array( $this, "thundertix_subdomain_cb" ),
      $this->plugin_name,
      "thundertix_instructions",
      array( 'label_for' => "thundertix_subdomain" )
    );

    add_settings_field(
      "thundertix_embed_performances",
      __( 'Embed performances', 'thundertix' ),
      array( $this, "thundertix_embed_performances_cb" ),
      $this->plugin_name,
      "thundertix_instructions",
      array( 'label_for' => "thundertix_embed_performances" )
    );

    register_setting(
      $this->plugin_name,
      "thundertix_data"
    );
  }

  /**
   * Render content for instructions section
   *
   * @since  1.0.0
   */
  public function thundertix_instructions_cb() {
    echo '<p>' . __( "1.- If you are the owner get the access token in your <a href='https://admin.thundertix.com/users'>thundertix account</a>.", 'thundertix' ) .'</p>';
    echo '<p>' . __( '2.- Fill the fields below.', 'thundertix' ) .'</p>';
    echo '<p>' . __( '3.- Press <strong>"Save Changes"</strong> button.', 'thundertix' ) .'</p>';
    echo '<p>' . __( '4.- Go to posts/pages section  and add ThunderTix events block.', 'thundertix' ) .'</p>';
  }

  /**
   * Render token field
   *
   * @since  1.0.0
   */
  public function thundertix_token_cb() {
    $data = get_option( "thundertix_data" );
    echo "<input type='password' name='thundertix_data[token]' value='{$data['token']}' required />";
  }

  /**
   * Render subdomain field
   *
   * @since  1.0.14
   */
  public function thundertix_subdomain_cb() {
    $data = get_option( "thundertix_data" );
    echo "<input type='text' name='thundertix_data[subdomain]' value='{$data['subdomain']}' required />";
  }

  /**
   * Render embed field
   *
   * @since 1.0.9
   */
  public function thundertix_embed_performances_cb() {
    $data = get_option( "thundertix_data" );
    $embed = $data['embed'];

    echo "<input type='radio' name='thundertix_data[embed]' value='true'". checked( 'true', $embed, false ) ."/>";
    echo "<span style='margin-right:20px;'>Yes</span>";

    echo "<input type='radio' name='thundertix_data[embed]' value='false'". checked( 'false', $embed, false ) ."/>";
    echo "<span>Not</span>";
  }

  /**
   * Add plugin page settings link.
   *
   * @since  1.0.1
   */
  public function thundertix_add_settings_link($links) {
    $settings_link = '<a href="' .
      admin_url( 'options-general.php?page=thundertix' ) .'">'
      . __( 'Settings', 'thundertix' ) . '</a>';

    array_unshift( $links, $settings_link );

    return $links;
  }
}

<?php

class Thundertix_Gutenberg {

  /**
   * The ID of this plugin.
   *
   * @since    1.0.2
   * @access   private
   * @var      string    $plugin_name    The ID of this plugin.
   */
  private $plugin_name;

  /**
   * The version of this plugin.
   *
   * @since    1.0.2
   * @access   private
   * @var      string    $version    The current version of this plugin.
   */
  private $version;

  /**
   * Initialize the class and set its properties.
   *
   * @since    1.0.2
   * @param      string    $plugin_name       The name of this plugin.
   * @param      string    $version    The version of this plugin.
   */
  public function __construct( $plugin_name, $version ) {

    $this->plugin_name = $plugin_name;
    $this->version = $version;

  }

  /**
   * Enqueue all Gutenberg blocks assets for only backend editor.
   *
   * @since 1.0.2
   */
  public function thundertix_enqueue_blocks_assets() {
    // Register css for both frontend + backend.
    wp_register_style(
      'thundertix-blocks-style',
      plugin_dir_url( __FILE__ ) . 'dist/blocks.style.build.css',
      array( 'wp-editor' ),
      //array( 'wp-blocks' ),
      filemtime( plugin_dir_path( __FILE__ ) . 'dist/blocks.style.build.css' )
    );

    // Register javascript for only backend editor.
    wp_register_script(
      'thundertix-blocks-js',
      plugin_dir_url( __FILE__ ) . 'dist/blocks.build.js',
      array( 'wp-blocks', 'wp-editor', 'wp-i18n', 'wp-element', 'wp-components' ),
      filemtime( plugin_dir_path( __FILE__ ) . 'dist/blocks.build.js' ),
      true
    );

    // Register css for only backend editor.
    wp_register_style(
      'thundertix-blocks-editor',
      plugin_dir_url( __FILE__ ) . 'dist/blocks.editor.build.css',
      array( 'wp-edit-blocks' ),
      filemtime( plugin_dir_path( __FILE__ ) . 'dist/blocks.editor.build.css' )
    );

    register_block_type(
      'thundertix/gutenberg-assets',
      array(
        'style' => 'thundertix-blocks-style',
        'editor_script' => 'thundertix-blocks-js',
        'editor_style' => 'thundertix-blocks-editor'
      )
    );
  }

  /**
   * Creates ThunderTix category.
   *
   * @since 1.0.2
   */
  public function thundertix_add_block_category( $categories ) {
    return array_merge(
      $categories,
      array(
        array(
          'slug' => 'thundertix',
          'title' => 'ThunderTix'
        )
      )
    );
  }

  /**
   * Register events block.
   *
   * @since 1.0.3
   */
  public function thundertix_register_events_block() {
    // Only load if Gutenberg is available.
    if ( ! function_exists( 'register_block_type' ) ) {
      return;
    }

    register_block_type( 'thundertix/events', array(
      'render_callback' => array( $this, 'display_events_view' )
    ) );
  }

  /**
   * Callback
   * Render events block.
   *
   * @since    1.0.0
   */
  public function display_events_view() {
    include_once 'partials/thundertix-gutenberg-events-view.php';
  }

}

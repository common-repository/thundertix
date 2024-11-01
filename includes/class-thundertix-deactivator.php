<?php

class Thundertix_Deactivator {

  /**
   * Short Description. (use period)
   *
   * Long Description.
   *
   * @since    1.0.0
   */
  public static function deactivate() {
    self::delete_thundertix_data();
  }

  /**
   * Deletes thundertix_data attribute from wp_options table.
   *
   * @since    1.0.5
   */
  private function delete_thundertix_data() {
    if ( get_option( 'thundertix_data' ) ) {
      delete_option( 'thundertix_data' );
    }
  }

}

<?php

class Thundertix_Activator {

  /**
   * Short Description. (use period)
   *
   * Long Description.
   *
   * @since    1.0.0
   */
  public static function activate() {
    self::create_thundertix_data();
  }

  /**
   * Creates and initial values for thundertix_data.
   *
   * @since    1.0.5
   */
  private function create_thundertix_data() {
    $data = array(
      'token' => '',
      'subdomain' => '',
      'embed' => 'true'
    );

    if ( ! get_option( 'thundertix_data' ) ) {
      add_option( 'thundertix_data', $data );
    }
  }

}

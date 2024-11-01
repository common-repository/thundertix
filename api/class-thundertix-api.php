<?php

class Thundertix_Api {

  /**
   * The thundertix base url.
   *
   * @since   1.0.8
   * @access  protected
   * @var     string $thundertix_base_url The thundertix base url
   */
  protected $thundertix_base_url;

  /**
   * The thundertix base client url.
   *
   * @since   1.0.11
   * @access  protected
   * @var     string $thundertix_base_url The thundertix base url
   */
  protected $thundertix_base_client_url;

  /**
   * The thundertix timeout.
   *
   * @since   1.0.16
   * @access  const
   * @var     int self::TIMEOUT
   */
  const TIMEOUT = 15;

  /**
   * Initialize the class and set its properties.
   *
   * @since    1.0.8
   * @param      string    $plugin_name       The name of the plugin.
   * @param      string    $version    The version of this plugin.
   */
  public function __construct() {

    $this->thundertix_base_url = $this->ttix_base_url();
    $this->thundertix_base_client_url = $this->ttix_base_client_url();

  }

  /**
   * Add some rest routes
   * /wp-json/thundertix/v1
   *
   * @since  1.0.8
   */
  public function thundertix_api_register_routes() {
    register_rest_route(
      $this->thundertix_version_api(),
      "events",
      array(
        "methods"  => "GET",
        "callback" => array($this, "events_index")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "events/(?P<id>\d+)/performances",
      array(
        "methods"  => "GET",
        "callback" => array($this, "events_show")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "events/(?P<event_id>\d+)/performances/(?P<performance_id>\d+)/saleable_seats/(?P<is_mobile>[A-Za-z]+)",
      array(
        "methods"  => "GET",
        "callback" => array($this, "saleable_seats")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "performances/(?P<performance_id>\d+)/orders/new",
      array(
        "methods"  => "GET",
        "callback" => array($this, "performances_orders_new")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "seats/orders/new",
      array(
        "methods"  => "POST",
        "callback" => array($this, "seats_orders_new")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "performances/orders",
      array(
        "methods"  => "POST",
        "callback" => array($this, "performances_orders_create")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "orders/(?P<id>\d+)/purchase",
      array(
        "methods"  => "PUT",
        "callback" => array($this, "orders_purchase_put")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "orders/(?P<id>\d+)/cancel",
      array(
        "methods"  => "POST",
        "callback" => array($this, "orders_cancel_post")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "orders/(?P<id>\d+)/validate_codes/(?P<coupons>[A-Za-z0-9-,\s]+)",
      array(
        "methods"  => "POST",
        "callback" => array($this, "orders_validate_codes_post")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "subregions/(?P<code>[A-Za-z0-9-,\s]+)",
      array(
        "methods"  => "GET",
        "callback" => array($this, "subregions")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "countries",
      array(
        "methods"  => "GET",
        "callback" => array($this, "countries")
      )
    );

    register_rest_route(
      $this->thundertix_version_api(),
      "orders/(?P<id>\d+)/rounding_donation",
      array(
        "methods"  => "POST",
        "callback" => array($this, "orders_rounding_donation")
      )
    );
  }

  /**
   * Event list
   * thundertix/v1/events
   *
   * @since  1.0.8
   */
  public function events_index() {
    if ( ! $this->thundertix_settings_are_configured() ) {

      return array(
        "status"  => "error",
        "message" => "Make sure you have configured thundertix settings",
        "url"     => "options-general.php?page=thundertix"
      );
    }

    $uri = "{$this->thundertix_base_client_url}/events.json";

    $response = wp_remote_get( $uri, array( "timeout" => SELF::TIMEOUT ) );

    $events = json_decode( wp_remote_retrieve_body( $response ) );

    return $this->filtered_events($events);
  }

  /**
   * Shows event's performances
   * thundertix/v1/events/1/performances
   *
   * @param event_id
   * @since  1.0.8
   */
  public function events_show( $request ) {
    $event_id = $request["id"];
    $uri = "{$this->thundertix_base_url}/barcode/performances/{$event_id}.json";

    $response = wp_remote_get( $uri, $this->options() );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Redirect to saleable chart
   * thundertix/v1/events/1/performances/1/saleable_seats
   *
   * @param event_id
   * @param performance_id
   * @since  1.0.8
   */
  public function saleable_seats( $request ) {
    $event_id       = $request["event_id"];
    $performance_id = $request["performance_id"];
    $is_mobile      = $request["is_mobile"];

    $uri = "{$this->thundertix_base_client_url}/events/{$event_id}/saleable_seats.json?performance_id={$performance_id}&force_mobile_base_size={$is_mobile}";

    $response = wp_remote_get( $uri, $this->options() );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Returns data for general performance sale
   * thundertix/v1/performances/1/orders/new
   *
   * @method GET
   * @param performance_id
   * @since  1.0.8
   */
  public function performances_orders_new( $request ) {
    $performance_id = $request["performance_id"];

    $uri = "{$this->thundertix_base_url}/orders/new.json?performance_id={$performance_id}";

    $response = wp_remote_get( $uri, $this->options() );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Returns data for general performance sale
   * thundertix/v1/seats/orders/new
   *
   * @method POST
   * @since  1.0.17
   */
  public function seats_orders_new( $request ) {
    $body = $request->get_body();

    $uri = "{$this->thundertix_base_url}/orders/new.json";

    $response = wp_remote_post( $uri, $this->options( $method = "POST", $body ) );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Create order's performance
   * thundertix/v1/performances/orders
   *
   * @param tickets
   * @param name's ticket
   * @param products
   * @param shipping
   * @since 1.0.11
   */
  public function performances_orders_create( $request ) {
    $performance_id = $request["performance_id"];
    $body = $request->get_body();

    $uri = "{$this->thundertix_base_url}/performances/{$performance_id}/orders.json";

    $response = wp_remote_post( $uri, $this->options( $method = "POST", $body ) );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Update order's performance
   * thundertix/v1/orders/id/purchase
   *
   * @param order_id
   * @param cc
   * @param email
   * @param order
   * @param date
   * @param payment_type
   * @since 1.0.12
   */
  public function orders_purchase_put( $request ) {
    $order_id = $request["id"];
    $body = $request->get_body();

    $uri = "{$this->thundertix_base_url}/orders/{$order_id}/purchase.json";

    $response = wp_remote_post( $uri, $this->options( $method = "PUT", $body ) );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Cancel order
   * thundertix/v1/orders/id/cancel
   *
   * @param order_id
   * @param cc
   * @param email
   * @param order
   * @param date
   * @param payment_type
   * @since 1.0.13
   */
  public function orders_cancel_post( $request ) {
    $order_id = $request["id"];

    $uri = "{$this->thundertix_base_url}/orders/{$order_id}/cancel.json";

    $response = wp_remote_post( $uri, $this->options( $method = "POST" ) );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Validate codes
   * thundertix/v1/orders/id/validate_codes/coupons
   *
   * @param coupons
   * @since 1.0.15
   */
  public function orders_validate_codes_post( $request ) {
    $order_id = $request["id"];
    $coupons = $request["coupons"];

    $uri = "{$this->thundertix_base_url}/orders/{$order_id}/validate_codes.json?coupons={$coupons}";

    $response = wp_remote_post( $uri, $this->options( $method = "POST" ) );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Subregions by country
   * thundertix/v1/subregions/code
   *
   * @method GET
   * @param code
   * @since 1.0.18
   */
  public function subregions( $request ) {
    $code = $request["code"];

    $uri = "{$this->thundertix_base_client_url}/subregion_options.json?country={$code}";

    $response = wp_remote_post( $uri, $this->options() );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  /**
   * Countries with priority United State and Canada
   * thundertix/v1/countries
   *
   * @method GET
   * @since 1.0.19
   */
  public function countries( $request ) {
    $uri = "{$this->thundertix_base_client_url}/countries_options";

    $response = wp_remote_post( $uri, $this->options() );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }

  private function options( $method = "GET", $body = [] ) {
    return array(
      "method"  => $method,
      "body"    => $body,
      "timeout" => self::TIMEOUT,
      "headers" => array(
        "Authorization" => "Basic {$this->ttix_token()}",
        "Content-Type"  => "application/json",
        "X-Reference"   => "wordpress",
        "Expires"       => "Wed, 11 Jan 1984 05:00:00 GMT",
        "Cache-Control" => "no-cache, must-revalidate, max-age=0",
        "Last-Modified" => false,
      )
    );
  }

  /**
   * Rounding donation order
   * thundertix/v1/orders/id/rounding_donation
   *
   * @param order_id
   * @since 1.0.20
   */
  public function orders_rounding_donation( $request ) {
    $order_id = $request["id"];

    $uri = "{$this->thundertix_base_url}/orders/{$order_id}/rounding_donation.json";

    $response = wp_remote_post( $uri, $this->options( $method = "POST" ) );

    return json_decode( wp_remote_retrieve_body( $response ) );
  }


  private function filtered_events($events) {
    $public_events = [];

    if ( is_array($events) || is_object($events) ) {
      foreach( $events as $event ) {
        if ( $this->event_should_be_visible( $event ) ) {
          array_push( $public_events, $event );
        }
      }
    }

    return $public_events;
  }

  private function event_should_be_visible($event) {
    return $this->event_is_public( $event->is_public ) &&
      $this->event_is_available( $event->expires );
  }

  private function event_is_public($is_public) {
    return $is_public === 1 ? true : false;
  }

  private function event_is_available($expires) {
    $now = new DateTime();

    return new DateTime( $expires ) > $now ? true : false;
  }

  private function event_is_general_admission($is_seating_chart) {
    return ! $is_seating_chart;
  }

  private function ttix_token() {
    $data = get_option( "thundertix_data" );

    return $data["token"];
  }

  private function ttix_subdomain() {
    $data = get_option( "thundertix_data" );

    return $data["subdomain"];
  }

  private function ttix_base_url() {
    return getenv("THUNDERTIX_DOMAIN") ?: "https://admin.thundertix.com";
  }

  private function ttix_base_client_url() {
    return str_replace(
      "admin",
      $this->ttix_subdomain(),
      $this->ttix_base_url()
    );
  }

  private function thundertix_settings_are_configured() {
    return $this->ttix_token() && $this->ttix_subdomain();
  }

  private function thundertix_version_api() {
    return "thundertix/v1";
  }

}

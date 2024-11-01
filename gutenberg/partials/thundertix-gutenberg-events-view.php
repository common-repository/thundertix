<?php wp_get_nocache_headers() ?>
<?php $events = (new Thundertix_Api)->events_index();

  if ( $events["status"] === "error") { ?>
    <div class="wp-block-thundertix-events">
      <div class="event">
        <a href="<?= get_admin_url(); ?><?= $events["url"] ?>" rel="nofollow">
          <?= $events["message"] ?>
        </a>
      </div>
    </div>
  <?php } elseif ( ! count($events) ) { ?>
    <div class="wp-block-thundertix-events">
      <div class="event">
        <?php __("No Events", "thundertix") ?>
      </div>
    </div>
  <?php } else { ?>

  <div class="wp-block-thundertix-events">
    <div id="thundertix_danger_alert"
      class="thundertix-alert thundertix-alert-danger thundertix_display_none"></div>

    <div class="thundertix_section">
      <div class="thundertix_events">
        <?php foreach ( $events as $event ) {
          $seating_chart = $event->seating_chart === true ? "true" : "false"
        ?>
          <div class="event">
            <div class="event-details">
              <article>
                <?php if ( $event->virtual ) { ?>
                  <div class="virtual-event">Virtual Event</div>
                <?php } ?>
                <?php if ( $event->picture ) { ?>
                  <div
                    class="event-image"
                    style="background-image: url(<?= $event->picture ?>)"
                  ></div>
                <?php } else { ?>
                  <div class="not-event-image"></div>
                <?php } ?>
                <div class="title-description">
                  <div class="row event-title clear">
                    <h4><?= $event->name ?></h4>
                    <div class="row event-date clear">
                      <?= date( "M d, Y", strtotime($event->created_at) ) ?> -
                      <?= date( "M d, Y", strtotime($event->expires) ) ?>
                    </div>
                  </div>
                  <div class="event-description">
                    <?= $event->description ?>
                  </div>
                </div>
              </article>
              <div class="event-actions">
                <?php if ( $event->on_sale ) { ?>
                  <button
                    type="button"
                    id="thundertix_event_button_<?= $event->id ?>"
                    onclick="ttix_selected_event(event)"
                    data-event-id="<?= $event->id ?>"
                    data-event-name="<?= $event->name ?>"
                    data-event-seating-chart="<?= $seating_chart ?>"
                    class="thundertix-button thundertix-button-success thundertix-button-block">
                    <?= __("Buy Tickets", "thundertix") ?>
                  </button>
                <?php } ?>
                <?php if ( $event->without_availability ) { ?>
                  <span class="warn sold-out-message">
                    <strong>
                      <?= $event->sold_out_message ?>
                    </strong>
                  </span>
                <?php } ?>
              </div>
            </div>
          </div>
        <?php } ?>
      </div>
    </div>

    <div class="thundertix_section" id="thundertix_performances_section">
      <table class="thundertix-performances-table">
        <tbody class="performances_area"></tbody>
      </table>
    </div>

    <div class="thundertix_section" id="thundertix_seating_chart">
      <div id="seating_chart_loading">Loading...</div>

      <h2 id="seating_chart_name"></h2>
      <span id="seating_chart_time"></span>
      <p id="seating_chart_max_ticket_limit" class="thundertix-price-red"></p>

      <div id="thundertix_seating_chart_svg"></div>
      <div id="seating_chart_tooltip"></div>
      <table class="thundertix-seating-chart-labels-table">
        <tbody id="thundertix_seating_chart_seat_name_labels"></tbody>
      </table>

      <button
        type="button"
        id="thundertix_seating_chart_continue_button"
        onclick="ttix_go_to_order_new()"
        class="thundertix-button thundertix-button-block thundertix-button-success"
        disabled>
        Continue
      </button>
    </div>

    <div class="thundertix_section" id="thundertix_new_performance_section">
      <div id="new_performance_loading">Loading...</div>

      <form id="thundertix_new_performance_form">
        <h2 id="new_performance_name"></h2>
        <span id="new_performance_time"></span>

        <div class="thundertix-items" id="thundertix_tickets_area"></div>

        <div class="thundertix-items" id="thundertix_named_tickets_area" style="display: none"></div>

        <div class="thundertix-items" id="thundertix_survey_area" style="display: none"></div>

        <div class="thundertix-donation thundertix-panel thundertix-bg-gray thundertix-padding-1-em"
          id="thundertix_donations_area" style="display: none;">
          <div id="thundertix_donation" class="thundertix-donation-title">
            <div id="thundertix_donations_title"></div>
            <div id="thundertix_donation_campaign_name" class="thundertix_display_none"></div>
            <div id="thundertix_donation_campaign_description"
              class="thundertix_display_none thundertix-text-muted thundertix-font-size-small"></div>
          </div>
          <div class="thundertix-item-price">
            <div class="thundertix-input-group">
              <div class="thundertix-input-group-addon">
                <i class="fa fa-dollar-sign" aria-hidden="true"></i>
              </div>
              <input id="thundertix_donation_price" min="0" class="thundertix-input" />
            </div>
          </div>
        </div>

        <div class="thundertix-items" id="thundertix_products_area" style="display: none"></div>

        <div class="thundertix-items thundertix-form-group" id="thundertix_shippings_area" style="display: none"></div>

        <div class="thundertix-items" id="thundertix_new_performance_button_area" style="display: none"></div>
      </form>
    </div>

    <div class="thundertix_section" id="thundertix_checkout_section">
      <table class="thundertix-checkout-table">
        <colgroup>
          <col style="width: 15%">
          <col style="width: 15%">
          <col style="width: 55%">
          <col style="width: 15%">
        </colgroup>
        <thead>
          <tr>
            <th align="left">QTY</th>
            <th>PRICE</th>
            <th>DESCRIPTION</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="thundertix_checkout_items_area"></tbody>
        <tfoot>
          <tr>
            <td colspan="2"></td>
            <td align="right">SUBTOTAL</td>
            <td id="thundertix_checkout_subtotal"></td>
          </tr>
          <tr id="thundertix_checkout_tax_area" style="display: none">
            <td colspan="2"></td>
            <td align="right">TAX</td>
            <td id="thundertix_checkout_tax"></td>
          </tr>
          <tr id="thundertix_checkout_base" style="display: none"></tr>
          <tr>
            <td colspan="2"></td>
            <th align="right">TOTAL</th>
            <td id="thundertix_checkout_total" style="white-space: nowrap"></td>
          </tr>
        <tfoot>
      </table>

      <form id="thundertix_coupons_form">
        <div id="thundertix_coupons_message"
          class="thundertix-margin-bottom-5 thundertix_display_none"></div>
        <div class="thundertix-coupon-area">
          <div class="thundertix-flex-3">
            <input
              type="text"
              id="thundertix_coupon_input"
              class="thundertix-input"
              autocomplete="off"
              placeholder="Enter Gift Card or Coupon Code."
              required />
          </div>

          <button
            type="submit"
            id="thundertix_coupon_button"
            class="thundertix-button thundertix-button-info">Apply</button>
        </div>
      </form>

      <form id="thundertix_checkout_form">
        <div class="thundertix-items-cc">
          <div class="thundertix-padding-bottom-2-px">
            <input
              type="text"
              id="thundertix_cc_number"
              class="thundertix-input"
              placeholder="Credit Card Number"
              required="required">
          </div>

          <div class="thundertix-cc-number-container">
            <div class="thundertix-cc-month-container thundertix-padding-right-1-px">
              <select id="thundertix_date_month"
                class="thundertix-select thundertix-width-100" required>
                <option value="">Select month</option>
                <option value="1">1 - January</option>
                <option value="2">2 - February</option>
                <option value="3">3 - March</option>
                <option value="4">4 - April</option>
                <option value="5">5 - May</option>
                <option value="6">6 - June</option>
                <option value="7">7 - July</option>
                <option value="8">8 - August</option>
                <option value="9">9 - September</option>
                <option value="10">10 - October</option>
                <option value="11">11 - November</option>
                <option value="12">12 - December</option>
              </select>
            </div>

            <div id="thundertix_date_year_area"
              class="thundertix-cc-container thundertix-padding-right-1-px"></div>

            <div class="thundertix-cc-container thundertix-padding-right-1-px">
              <input type="tel" id="thundertix_cc_cvv" class="thundertix-input"
                maxlength="4" placeholder="CVV" required="required">
            </div>
          </div>
        </div>

        <input type="text" id="thundertix_cc_fname" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="First Name" required="required">
        <input type="text" id="thundertix_cc_lname" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Last Name" required="required">
        <input type="email" id="thundertix_email" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Email" required="required">
        <input type="tel" id="thundertix_order_phone" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Phone" required="required">
        <input type="text" id="thundertix_order_company_name" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Company Name - Optional">

        <div id="thundertix_billing_inputs">
          <p>Billing Address <span>(as shown on credit card statement)</span></p>
          <input type="text" id="thundertix_order_billing_address_1" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Address" required="required">
          <input type="text" id="thundertix_order_billing_address_2" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Apt or Suite - Optional">
          <input type="text" id="thundertix_order_billing_city" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="City" required='required'>

          <select id="thundertix_order_billing_country" onchange="ttix_request_states(event)" class="thundertix-select" style="width: 100%; color: #979797; margin-bottom: 10px !important;" required="required"></select>
          <select id="thundertix_order_billing_state" class="thundertix-select" style="width: 100%; color: #979797; margin-bottom: 10px !important;" required="required"></select>

          <input type="text" id="thundertix_order_billing_zip" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="ZIP/Postal Code" required="required">
          <textarea id="thundertix_order_comments" class="thundertix-comment-input" rows="3" style="width:100%" placeholder="Comments - Optional"></textarea>
        </div>

        <div id="thundertix_shipping_inputs">
          <p>Shipping Address</p>
          <label>
            <input
              type="checkbox"
              onclick="ttix_copy_billing_info()"
              id="thundertix_order_copy_billing_info" />
            Same as billing
          </label>
          <input type="text" id="thundertix_order_shipping_to_name" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Name - Optional">
          <input type="text" id="thundertix_order_shipping_address_1" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Address - Optional">
          <input type="text" id="thundertix_order_shipping_address_2" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Apt or Suite - Optional">
          <input type="text" id="thundertix_order_shipping_city" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="City - Optional">
          <input type="text" id="thundertix_order_shipping_country" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="Country - Optional">
          <input type="text" id="thundertix_order_shipping_state" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="State - Optional">
          <input type="text" id="thundertix_order_shipping_zip" class="thundertix-input" style="margin-bottom: 10px !important;" placeholder="ZIP/Postal Code - Optional">
        </div>

        <label>
          <input
            type="checkbox"
            onclick="ttix_toggle_opt_in()"
            id="thundertix_order_opt_in" />

          <div id="thundertix_include_me_in_mailing_list"
                class="thundertix-display-inline"></div>
        </label>

        <p>By clicking "Confirm Order", I understand the credit card entered will be charged at this time.</p>

        <div id="thundertix_policy_area" style="display: none; margin-top: 30px;">
          <div id="thundertix_policy_one"></div>

          <div id="thundertix_policy_two"></div>
        </div>

        <div class="thundertix-items">
          <button type="submit"
            id="thundertix_confirm_order_button"
            class="thundertix-button thundertix-button-success thundertix-button-block">
            Confirm Order
          </button>

          <button
            type="button"
            id="thundertix_cancel_order_button"
            onclick="ttix_cancel_order()"
            class="thundertix-button thundertix-button-danger thundertix-button-block margin-top-10">
            Cancel Order
          </button>
        </div>
      </form>
    </div>

    <div class="thundertix_section" id="thundertix_thank_you_section">
      <h2 id="thundertix_thank_you_message"></h2>
      <div id="thundertix_thank_you_receipt_number"></div>
    </div>

    <div id="thundertix_wrapper_modal" class="wrapper-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="thundertix-close" onclick="ttix_close_modal()">&times;</span>
        </div>
        <div class="modal-content">
          <table class="thundertix-table">
            <tbody class="performances_area"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="thundertix_donor_rounding_modal" class="wrapper-modal">
      <form id="thundertix_donor_rounding_form">
        <div class="modal sm-modal">
          <div id="thundertix_donation_text" class="modal-content"></div>
          <div class="modal-footer thundertix-text-align-right">
            <button type="submit"
              id="thundertix_donor_rounding_button"
              class="thundertix-button thundertix-button-success">Absolutely!</button>
            <button
              type="button"
              class="thundertix-button thundertix-button-white"
              onclick="ttix_close_modal()">
              No, thank you
            </button>
          </div>
        </div>
      </form>
    </div>

    <div id="thundertix_cancel_order_modal" class="wrapper-modal">
      <form id="thundertix_donor_rounding_form">
        <div class="modal sm-modal">
          <div class="modal-content">
            <div class="thundertix-padding-5-p">
              <p class="thundertix-font-size-25-px thundertix-color-blue">Cancel Order?</p>
              <p class="thundertix-font-size-20-px">
                Are you sure you want to leave the page and cancel the order?
              </p>
            </div>
          </div>
          <div class="modal-footer thundertix-text-align-right">
            <button type="submit"
              id="thundertix_cancel_order_button_modal"
              onclick="ttix_request_cancel_order()"
              class="thundertix-button thundertix-button-blue">Cancel Order</button>
            <button
              type="button"
              class="thundertix-button thundertix-button-white"
              onclick="ttix_close_modal()">
              Stay
            </button>
          </div>
        </div>
      </form>
    </div>

  </div>
  <?php } ?>


const TIMEOUT10000               = 10000
const TIMEOUT2000                = 2000
const DISPLAY_EVENTS             = 0
const DISPLAY_PERFORMANCES_EMBED = 1
const DISPLAY_SEATING_CHART      = 2
const DISPLAY_NEW_ORDER          = 3
const DISPLAY_CHECKOUT           = 4
const DISPLAY_THANK_YOU          = 5
const DISPLAY_PERFORMANCES_MODAL = 99
const NAMED_IS_NOT_REQUIRED      = 0
const NAMED_IS_REQUIRED          = 2
const KEYS_PER_ROW               = 3

var thundertix = ttix_initial_values()
function ttix_initial_values() {
  return {
    event: {},
    performance: { is_single: false },
    new_order: {},
    checkout: {},
    saleable_seats_ids: [],
    seating_chart: {},
    thank_you: {},
  }
}

document.addEventListener("DOMContentLoaded", function() {
  ttix_show_section(DISPLAY_EVENTS)
})

function ttix_show_section(current) {
  switch(current) {
    case DISPLAY_EVENTS:
      ttix_reset_values()
      ttix_close_modal()
      ttix_hide_in_progress_event_buttons()
      break
    case DISPLAY_PERFORMANCES_EMBED:
      ttix_scroll_to("thundertix_performances_section")
      ttix_return_to_section(DISPLAY_EVENTS)
      break
    case DISPLAY_SEATING_CHART:
      ttix_fetch_seating_chart()
      ttix_scroll_to("thundertix_seating_chart")
      ttix_return_to_section(ttix_display_performances_view())
      break
    case DISPLAY_NEW_ORDER:
      ttix_fetch_new_order_data()
      ttix_close_performances_modal_if_is_open()
      ttix_scroll_to("thundertix_new_performance_section")
      ttix_reset_terms_and_conditions()
      ttix_return_to_section(ttix_display_performances_view())
      break
    case DISPLAY_CHECKOUT:
      ttix_scroll_to("thundertix_checkout_section")
      ttix_return_to_section(DISPLAY_NEW_ORDER)
      break
    case DISPLAY_THANK_YOU:
      ttix_scroll_to("thundertix_thank_you_section")
      ttix_reset_values()
      ttix_return_to_section(DISPLAY_EVENTS)
      break
    case DISPLAY_PERFORMANCES_MODAL:
      current = DISPLAY_EVENTS
      ttix_display_performances_modal()
      break
    default:
      ttix_show_section(DISPLAY_EVENTS)
  }

  let sections = ttix_sections()
  if ( ! sections.length ) return

  sections.forEach(function(section) {
    section.style.display = "none"
  })
  sections[current].style.display = "block"
}

function ttix_sections() {
  return ttix_query_selector_all(".thundertix_section")
}

function ttix_selected_event(e) {
  ttix_set_event({})
  let dataset = e.target.dataset
  ttix_set_event({
    id: dataset.eventId,
    name: dataset.eventName,
    seating_chart: ttix_parse_to_boolean(dataset.eventSeatingChart),
  })
  ttix_fetch_performances()
}

function ttix_fetch_performances() {
  const id  = ttix_event_id()
  const uri = `${ttix_base_api()}/events/${id}/performances`

  ttix_show_in_progress(`thundertix_event_button_${id}`)
  ttix_fetch(uri)
    .then( data => {
      let performances = ttix_event_has_public_performances(data)
      if ( ! performances.length ) return ttix_init_the_sales_process()

      if (ttix_event_has_one_performance(performances)) {
        ttix_set_performance(performances[0])
        let date = ttix_selected_date_performance(ttix_performance())
        ttix_set_performance_selected_date(date)
        ttix_set_performance_is_single(true)
        ttix_redirect_or_display_new_order()
      } else {
        ttix_set_performance_is_single(false)
        ttix_draw_performances_area(performances)
        ttix_show_section(ttix_display_performances_view())
      }
      ttix_hide_in_progress(`thundertix_event_button_${id}`, "Buy Tickets")
    })
}

function ttix_event_has_public_performances(performances) {
  return performances.filter(ttix_is_public)
}

function ttix_event_has_one_performance(performances) {
  return performances.length === 1
}

function ttix_draw_performances_area(performances) {
  let performance_area = `
    <colgroup>
      <col style="width: 40%">
      <col style="width: 50%">
      <col style="width: 10%">
    </colgroup>
    <tr>
      <td>NAME</td>
      <td>DESCRIPTION</td>
      <td></td>
    </tr>
  `

  performances.forEach( performance => {
    performance.selected_date = ttix_selected_date_performance(performance)

    performance_area += `
      <tr>
        <td>${ performance.name }</td>
        <td>${ performance.selected_date }</td>
        <td>${ ttix_show_performance_button(performance) }</td>
      </tr>
    `
  })

  let areas = ttix_get_elements_by_class_name("performances_area")
  for (let i = 0; i < areas.length; i++) {
    areas[i].innerHTML = performance_area
  }
}

function ttix_show_performance_button(performance) {
  return performance.available ?
    `<button
      type="button"
      class="thundertix-button thundertix-button-success thundertix-button-block"
      onclick="ttix_selected_performance(event)"
      id="thundertix_performance_button_${performance.id}"
      data-performance-id="${performance.id}"
      data-performance-time="${performance.time}"
      data-performance-name="${performance.name}"
      data-performance-available="${performance.available}"
      data-performance-sold-seats="${performance.sold_seats}"
      data-performance-hide-date="${performance.hide_date}"
      data-performance-replace-date="${performance.replace_date}"
      data-performance-hide-sold-out="${performance.hide_sold_out}"
      data-performance-sold-out-message="${performance.sold_out_message}"
      data-performance-selected-date="${performance.selected_date}"
    > Select </button>` :
    ttix_sold_out_message(performance)
}

function ttix_sold_out_message({hide_sold_out, sold_out_message}) {
  return hide_sold_out ?
    `<span style="color: red">${sold_out_message}</span>` :
    '<span style="color: red">SOLD OUT</span>'
}

function ttix_selected_date_performance({hide_date, replace_date, time}) {
  return hide_date ? replace_date : ttix_format_date(time)
}

function ttix_selected_performance(event) {
  let dataset = event.target.dataset
  let data = {
    id: dataset.performanceId,
    time: dataset.performanceTime,
    name: dataset.performanceName,
    available: dataset.performanceAvailable,
    sold_seats: dataset.performanceSoldSeats,
    hide_date: dataset.performanceHideDate,
    replace_date: dataset.performanceReplaceDate,
    hide_sold_out: dataset.performanceHideSoldOut,
    sold_out_message: dataset.performanceSoldOutMessage,
    selected_date: dataset.performanceSelectedDate,
    is_single: false,
  }

  ttix_set_performance({})
  ttix_set_performance(data)
  ttix_redirect_or_display_new_order()
}

function ttix_fetch_seating_chart() {
  const event_id       = ttix_event_id()
  const performance_id = ttix_performance_id()
  const is_mobile      = ttix_is_mobile_device()
  const uri = `${ttix_base_api()}/events/${event_id}/performances/${performance_id}/saleable_seats/${is_mobile}`

  ttix_set_seating_chart({})
  ttix_fetch(uri)
    .then( data => {
      ttix_set_seating_chart(data)
      ttix_show("seating_chart_loading")
      ttix_draw_seating_chart()
      ttix_hide("seating_chart_loading")
    })
}

function ttix_draw_seating_chart() {
  if ( ! ttix_seating_chart_svg() ) return ttix_init_the_sales_process()

  ttix_text("seating_chart_name", ttix_performance_name())
  ttix_text("seating_chart_time", ttix_performance_selected_date())
  ttix_text("seating_chart_max_ticket_limit", ttix_max_ticket_limit_text())

  ttix_text("thundertix_seating_chart_svg", ttix_seating_chart_svg())
  ttix_text(
    "thundertix_seating_chart_seat_name_labels",
    ttix_draw_seating_chart_seat_name_labels()
  )

  rowsToCircularTables()
  rowsToRectangularTables()
  resizeGraphicElementsToMobileView()
  ttix_add_event_listener_to_seats()
}

function ttix_max_ticket_limit_text() {
  if ( ! ttix_seating_chart_max_ticket_limit() ) return ""

  return `Click to select up to ${ttix_seating_chart_max_ticket_limit()} selections.`
}

function ttix_draw_seating_chart_seat_name_labels() {
  let labels = ttix_seating_chart_seat_name_labels()
  if ( ! labels.length ) return ""

  let labels_area = `
    <colgroup>
      <col style="width: 33%">
      <col style="width: 33%">
      <col style="width: 33%">
    </colgroup>`

  ttix_split_seat_name_labels_by_rows(labels, KEYS_PER_ROW).forEach(row => {
    labels_area += "<tr>"
    row.forEach(label => {
      labels_area += `
        <td>
          <svg height="15" width="15" style="cursor: default;">
            ${label.icon}
          </svg>
          ${label.text}
        </td>`
    })
    labels_area += "</tr>"
  })

  return labels_area
}

function ttix_split_seat_name_labels_by_rows(items, per_row) {
  return items.reduce((accumulator, item, index) => {
    const chunk_index = Math.floor(index / per_row)
    if ( ! accumulator[chunk_index] ) accumulator[chunk_index] = []

    accumulator[chunk_index].push(item)

    return accumulator
  }, [])
}

function ttix_go_to_order_new() {
  if ( ! ttix_selected_seats_are_under_max_ticket() ) {
    return ttix_danger_alert(ttix_exceeded_max_ticket_limit_alert())
  }

  ttix_show_section(DISPLAY_NEW_ORDER)
}

function ttix_selected_seats_are_under_max_ticket() {
  return ttix_are_saleable_seats_selected() <= ttix_seating_chart_max_ticket_limit()
}

function ttix_exceeded_max_ticket_limit_alert() {
  return `You cannot select more than ${ttix_seating_chart_max_ticket_limit()} seats in a single order. Please deselect seats to submit your order.`
}

function ttix_toggle_disabled_continue_button() {
  let button = ttix_get_element_by_id("thundertix_seating_chart_continue_button")
  ttix_are_saleable_seats_selected() ?
    button.disabled = false :
    button.disabled = true
}

function ttix_are_saleable_seats_selected() {
  return ttix_saleable_seats_ids().length
}

function ttix_has_selected_multiple_saleable_seats() {
  return ttix_are_saleable_seats_selected() > 1
}

function ttix_add_or_remove_saleable_seats(seat) {
  let saleable_id = seat.dataset.saleableSeatId
  let shape       = seat.querySelector(".shape")

  if (ttix_saleable_seats_ids().includes(saleable_id)) {
    ttix_remove_seating_chart_id(saleable_id)
    ttix_change_shape_state(shape, "transparent", "open")
  } else {
    ttix_add_seating_chart_id(saleable_id)
    ttix_change_shape_state(shape, "#e92", "selected")
  }
}

function ttix_change_shape_state(shape, fill, state) {
  shape.setAttribute("fill", fill)
  shape.dataset.state = state
}

function ttix_add_seating_chart_id(saleable_id) {
  ttix_saleable_seats_ids().push(saleable_id)
}

function ttix_remove_seating_chart_id(saleable_id) {
  let seats = ttix_saleable_seats_ids().filter(id => id != saleable_id)
  ttix_set_saleable_seats_ids(seats)
}

function showTooltip(evt, text) {
  let tooltip = ttix_get_element_by_id("seating_chart_tooltip")
  tooltip.innerHTML     = text
  tooltip.style.display = "block"
  tooltip.style.left    = `${evt.pageX}px`
  tooltip.style.top     = `${evt.pageY + 20 }px`
}

function hideTooltip() {
  ttix_get_element_by_id("seating_chart_tooltip").style.display = "none"
}

function ttix_fetch_new_order_data() {
  ttix_is_selling_saleable_seats() ?
    ttix_fetch_saleable_seats_new_order() :
    ttix_fetch_general_admission_new_order()
}

function ttix_fetch_general_admission_new_order() {
  const performance_id = ttix_performance_id()
  const uri = `${ttix_base_api()}/performances/${performance_id}/orders/new`

  ttix_show_in_progress(`thundertix_performance_button_${performance_id}`)
  ttix_set_new_order({})
  ttix_fetch(uri)
    .then( data => {
      ttix_set_new_order(data)
      ttix_show("new_performance_loading")
      ttix_add_data_new_order()
      ttix_hide("new_performance_loading")
      ttix_hide_in_progress(`thundertix_performance_button_${performance_id}`, "Select")
    })
}

function ttix_fetch_saleable_seats_new_order() {
  const uri = `${ttix_base_api()}/seats/orders/new`
  let body  = ttix_parse_seats_new_order()

  ttix_show_in_progress("thundertix_seating_chart_continue_button")
  ttix_set_new_order({})
  ttix_fetch(uri, { method: "POST", body: JSON.stringify(body) })
    .then( data => {
      ttix_set_new_order(data)
      ttix_show("new_performance_loading")
      ttix_add_data_new_order()
      ttix_hide("new_performance_loading")
      ttix_hide_in_progress("thundertix_seating_chart_continue_button", "Continue")
    })
}

function ttix_parse_seats_new_order() {
  return {
    performance_id: ttix_performance_id(),
    seats: ttix_parse_seats(),
  }
}

function ttix_parse_seats() {
  let seats = {}
  ttix_saleable_seats_ids().forEach( seat => seats[seat] = seat )
  return seats
}

function ttix_add_data_new_order() {
  ttix_text("new_performance_name", ttix_performance_name())
  ttix_text("new_performance_time", ttix_performance_selected_date())
  ttix_draw_ticket_type_area()
  ttix_draw_survey_area()
  ttix_draw_donations_area()
  ttix_draw_products_area()
  ttix_draw_shippings_area()
  ttix_draw_new_performance_button_area()

  let performance_form = ttix_get_element_by_id("thundertix_new_performance_form")
  performance_form.addEventListener("submit", ttix_request_new_performance_order)
}

function ttix_draw_ticket_type_area() {
  ttix_is_selling_saleable_seats() ?
    ttix_draw_saleable_seats_ticket_type_area() :
    ttix_draw_general_admission_ticket_type_area()
}

function ttix_reset_data() {
  ttix_reset_new_performance_order()
  ttix_reset_campaigns()
  ttix_reset_seating_chart()
  ttix_reset_checkout()
}

function ttix_reset_new_performance_order() {
  [
    "new_performance_name",
    "new_performance_time",
    "thundertix_tickets_area",
    "thundertix_survey_area",
    "thundertix_named_tickets_area",
    "thundertix_products_area",
    "thundertix_shippings_area",
    "thundertix_new_performance_button_area",
  ].forEach((id) => ttix_get_element_by_id(id).innerHTML = "")
}

function ttix_reset_campaigns() {
  ttix_text("thundertix_donation_campaign_name")
  ttix_text("thundertix_donation_campaign_description")
  ttix_display("thundertix_donations_area", "none")
  ttix_set_value("thundertix_donation_price")
  ttix_remove_elements(ttix_query_selector_all(".remove_campaign_id"))
}

function ttix_reset_seating_chart() {
  ttix_text("seating_chart_name")
  ttix_text("seating_chart_time")
  ttix_text("thundertix_seating_chart_svg")
  ttix_text("thundertix_seating_chart_seat_name_labels")

  ttix_hide("thundertix_seating_chart_continue_button")
}

function ttix_reset_checkout() {
  ttix_hide("thundertix_danger_alert")
  ttix_enabling_checkout_button()
}

function ttix_reset_terms_and_conditions() {
  ttix_text("thundertix_policy_one")
  ttix_text("thundertix_policy_two")
  ttix_display("thundertix_policy_area", "none")
}

function ttix_draw_general_admission_ticket_type_area() {
  let tickets = ttix_new_order_tickets()
  if ( ! tickets.length ) return

  let tickets_template = ""
  tickets.map( ticket => {
    tickets_template += `
      <div class="thundertix-item thundertix-panel thundertix-border">
        <div class="thundertix-item-quantity">
          ${ttix_tickets_select_options(ticket)}
        </div>
        <div class="thundertix-name-description">
          <h4 class="ticket-type-name">${ticket.name}</h4>
          <p class="ticket-type-description">${ticket.description}</p>
        </div>
        <div class="thundertix-item-price">
          ${ttix_format_price(ticket.price)}
        </div>
      </div>
    `
  })

  ttix_text("thundertix_tickets_area", tickets_template)
}

function ttix_draw_saleable_seats_ticket_type_area() {
  let saleable_seats = ttix_new_order_saleable_seats()
  if ( ! saleable_seats.length ) return

  let saleable_template = ""
  saleable_seats.map( ss => {
    saleable_template += `
      <div class="thundertix-item thundertix-panel">
        <div class="thundertix-saleable-seat-quantity">1</div>
        <div class="thundertix-saleable-seat-description">
          <div class="thundertix-saleable-seat-item">${ss.name}</div>
          <div class="thundertix-saleable-seat-item">
            ${ttix_show_saleable_seat_ticket_options(ss)}
            ${ttix_show_saleable_seat_ticket_name_options(ss)}
          </div>
        </div>
        <div id="thundertix_saleable_seat_price_${ss.id}"
          class="thundertix-item-price">
          ${ttix_show_saleable_seat_price()}
        </div>
      </div>`
  })

  ttix_text("thundertix_tickets_area", saleable_template)
}

function ttix_show_saleable_seat_ticket_options(ss) {
  if (ttix_new_order_has_one_ticket())
    return ttix_show_one_saleable_seat_ticket(ss)

  return ttix_show_multiple_saleable_seat_tickets(ss)
}

function ttix_show_one_saleable_seat_ticket(ss) {
  let ticket       = ttix_new_order_first_ticket()
  let ticket_price = ttix_format_price(ticket.price)

  return `
    <div>${ticket.name}</div>
    <div class="thundertix-gray-color thundertix-font-size-15-px">
      ${ticket.description}
    </div>

    <select
      id="thundertix_ticket_saleable_seat_select_${ss.id}"
      data-ticket-id="${ticket.id}"
      data-saleable-seat-id="${ss.id}"
      class="thundertix_display_none">
        <option
          value="${ticket.id}"
          data-ticket-price="${ticket_price}"
          title="${ticket.description}">
          ${ticket.name} - ${ticket_price}
        </option>
    </select>`
}

function ttix_show_multiple_saleable_seat_tickets(ss) {
  let tags = `
    <select
      id="thundertix_ticket_saleable_seat_select_${ss.id}"
      data-ticket-id=""
      data-saleable-seat-id="${ss.id}"
      class="thundertix-select"
      onchange="ttix_choose_ticket_type(event)"
      style="width: 100% !important;"
      required>
        ${ttix_ticket_type_options()}
    </select>
  `

  if (ttix_has_selected_multiple_saleable_seats())
    tags += ttix_apply_all_saleable_seats_button(ss)

  return tags
}

function ttix_apply_all_saleable_seats_button(ss) {
  return `
    <button
      type="button"
      id="thundertix_apply_all_saleable_seat_button_${ss.id}"
      class="thundertix-button thundertix-button-white thundertix-margin-top-5 thundertix_display_none"
      data-saleable-seat-id="${ss.id}"
      onclick="ttix_apply_to_all_saleable_seats(event)">
      Apply to All
    </button>`
}

function ttix_ticket_type_options() {
  let tickets = ttix_new_order_tickets()
  if ( ! tickets.length ) return

  let ticket_options = `
    <option value="" data-ticket-price="--">
      Select ticket type
    </option>`
  tickets.map(({ id, name, price, description}) => {
    ticket_options += `
      <option
        value="${id}"
        data-ticket-price="${ttix_format_price(price)}"
        data-ticket-name="${name}"
        title="${description}">
        ${name} - ${ttix_format_price(price)}
      </option>`
  })
  return ticket_options
}

function ttix_choose_ticket_type(event) {
  let select                 = event.currentTarget
  let option                 = select.options[select.selectedIndex]
  let saleable_seat_id       = select.dataset.saleableSeatId
  let ticket_price           = option.dataset.ticketPrice
  select.dataset.ticketId    = select.value
  select.dataset.ticketPrice = ticket_price
  select.dataset.ticketName  = option.dataset.ticketName

  ttix_text(`thundertix_saleable_seat_price_${saleable_seat_id}`, ticket_price)
  ttix_hide_apply_all_saleable_seat_buttons()
  ttix_show_saleable_seat_button(saleable_seat_id)
}

function ttix_show_saleable_seat_button(saleable_seat_id) {
  let id = `thundertix_apply_all_saleable_seat_button_${saleable_seat_id}`
  if (ttix_get_element_by_id(id)) ttix_show(id)
}

function ttix_ticket_saleable_seat_select(id) {
  return ttix_get_element_by_id(`thundertix_ticket_saleable_seat_select_${id}`)
}

function ttix_apply_to_all_saleable_seats(event) {
  let saleable_seat_id       = event.currentTarget.dataset.saleableSeatId
  let currentSelect = ttix_ticket_saleable_seat_select(saleable_seat_id)
  ttix_saleable_seat_ticket_selects().forEach((select) => {
    select.dataset.ticketId   = currentSelect.dataset.ticketId
    select.selectedIndex      = currentSelect.selectedIndex
    select.dataset.ticketName = currentSelect.dataset.ticketName
    ttix_text(
      `thundertix_saleable_seat_price_${select.dataset.saleableSeatId}`,
      currentSelect.dataset.ticketPrice
    )
  })
}

function ttix_show_saleable_seat_price() {
  return ttix_new_order_has_one_ticket() ?
    ttix_format_price(ttix_new_order_first_ticket_price()) :
    "--"
}

function ttix_show_saleable_seat_ticket_name_options(ss) {
  if (ttix_not_collect_the_customer_name()) return ""

  return `
    <div class="thundertix-margin-top-5">
      ${ttix_customer_name_per_ticket_input(ss.seat_id)}
    </div>
  `
}

function ttix_saleable_seat_ticket_selects() {
  let seats = ttix_query_selector_all("[id^='thundertix_ticket_saleable_seat_select_']")
  return Array.from(seats)
}

function ttix_hide_apply_all_saleable_seat_buttons() {
  if (!ttix_saleable_seat_apply_all_buttons().length) return

  ttix_saleable_seat_apply_all_buttons().map((button) => ttix_hide(button.id))
}

function ttix_saleable_seat_apply_all_buttons() {
  let buttons = ttix_query_selector_all("[id^='thundertix_apply_all_saleable_seat_button_']")
  return Array.from(buttons)
}


function ttix_draw_survey_area() {
  if ( ! ttix_new_order_survey() ) return

  const poll = ttix_new_order_survey_poll()
  let survey_template = `
    <input type="hidden" value="${poll.id}" id="thundertix_poll_id_input" />
  `

  for (let i = 1; i <= 5; i++) {
    let question = `q${i}`
    if ( ! poll[question] ) { continue }

    let is_required = `r${i}`,
      is_open = `answer_type${i}`,
      answers = `answer_text${i}`,
      required = poll[is_required] ? "required='required'" : ''

    let input = poll[is_open] === 'open' ?
      ttix_answer_input(i, required) :
      ttix_answer_select(
        i,
        required,
        ttix_options_dropdown(poll[answers])
      )

    survey_template += `
      <div class="thundertix-items thundertix-form-group">
        <label>${poll[question]}</label>
        ${input}
      </div>`
  }

  ttix_text("thundertix_survey_area", survey_template)
  ttix_display("thundertix_survey_area")
}

function ttix_draw_donations_area() {
  if ( ! ttix_new_order_has_donation() ) return
  const order_campaigns = ttix_new_order_reduced_campaigns()

  if (order_campaigns.length === 1) {
    ttix_draw_single_campaign(order_campaigns[0])
  } else if (order_campaigns.length > 1) {
    ttix_draw_select_campaigns(order_campaigns)
  }

  ttix_text("thundertix_donations_title", ttix_new_order_donation_text())
  ttix_display("thundertix_donations_area")
}

function ttix_draw_single_campaign(campaign) {
  ttix_text("thundertix_donation_campaign_name", campaign.name)
  ttix_text("thundertix_donation_campaign_description", campaign.description)

  let input = ttix_create_element("input", {
    type: "hidden",
    id: "thundertix_donation_campaign_id",
    class: "remove_campaign_id",
    value: campaign.id
  })

  ttix_insert_before(
    input,
    ttix_get_element_by_id("thundertix_donation_campaign_description")
  )

  ttix_show("thundertix_donation_campaign_name")
  ttix_show("thundertix_donation_campaign_description")
}

function ttix_draw_select_campaigns(options) {
  let select = ttix_create_element("select", {
    id: "thundertix_donation_campaign_id",
    class: "thundertix-select remove_campaign_id",
    onchange: "ttix_draw_campaign_description(event)"
  })

  options.unshift({ id: "", description: "", name: "Select a campaign" })
  ttix_options_campaigns(select, options)

  ttix_insert_before(
    select,
    ttix_get_element_by_id("thundertix_donation_campaign_description")
  )
}

function ttix_draw_campaign_description(event) {
  let select = event.target
  let option = select.options[select.selectedIndex]

  ttix_text("thundertix_donation_campaign_description", option.dataset.description)
  ttix_show("thundertix_donation_campaign_description")
}

function ttix_draw_products_area() {
  let products = ttix_new_order_products()
  if ( ! products.length ) return

  let products_template = `<span>Consider these additions to your order:</span>`
  products.map( ({ id, name, price, description, product_options, picture }) => {
    products_template += `
      <div class="thundertix-item thundertix-panel thundertix-border"
        id="thundertix_product_area_${id}">
        <div class="thundertix-item-quantity" scope="col">
          <select
            id="thundertix_products_select_${id}"
            data-product-id="${id}-a"
            data-product-has-options="${product_options.length}"
            onchange="ttix_verify_product_quantity(${id})"
            class="thundertix-select">
              ${ttix_options_products(50)}
          </select>
        </div>
        <div class="thundertix-name-description">
          <h4 class="ticket-type-name">
            ${name}
            ${ttix_show_product_icon(picture)}
          </h4>
          <p class="ticket-type-description">${description}</p>
          <div>
            ${ttix_product_options_select(product_options)}

            <button
              type="button"
              id="thundertix_clone_product_button_${id}"
              onclick="thundertix_clone_product(${id})"
              class="button-product-option thundertix_display_none">
                <span>&#43;</span>
            </button>
          </div>
        </div>
        <div scope="col" class="thundertix-item-price">
          ${ttix_format_price(price)}
        </div>
      </div>
    `
  })

  ttix_text("thundertix_products_area", products_template)
  ttix_display("thundertix_products_area")
}

function ttix_show_product_icon(picture) {
  if (!picture) return "";

  return `
    <div class="thundertix-float-right thundertix-cursor-pointer thundertix-tooltip-product-picture">
      <em class="fa fa-image"></em>
      <span><img src="${picture}" /></span>
    </div>`
}

function ttix_draw_shippings_area() {
  let shippings = ttix_new_order_reduced_shippings()
  let filtered_shippings = shippings.filter(ttix_by_visible)
  if ( ! filtered_shippings.length ) return

  let shippings_template = `
    <select id="thundertix_shipping_select" class="thundertix-select" required>
      ${ttix_options_shipping(filtered_shippings)}
    </select>
  `

  ttix_text("thundertix_shippings_area", shippings_template)
  ttix_display("thundertix_shippings_area", "flex")
}

function ttix_draw_new_performance_button_area() {
  let button = `
    <button
      type="submit"
      id="thundertix_new_performance_button"
      class="thundertix-button thundertix-button-success thundertix-button-block">
      Continue
    </button>`

  ttix_text("thundertix_new_performance_button_area", button)
  ttix_display("thundertix_new_performance_button_area", "block")
}

function ttix_draw_named_tickets_area() {
  let names_template = ""
  let items = ttix_ticket_fields_with_value()

  items.map( ticket => {
    let id     = ticket.dataset.ticketId
    let name   = ticket.dataset.ticketName
    let number = parseInt(ticket.value)

    for ( let i = 0; i < number; i++ ) {
      names_template += `
        <div class="thundertix-padding-bottom-5">
          <p class="thundertix-margin-bottom-0">${name}</p>
          <p class="thundertix-margin-bottom-0 thundertix-margin-top-0">Name:</p>
          ${ttix_customer_name_per_ticket_input(id, name)}
        </div>
      `
    }
  })

  ttix_text("thundertix_named_tickets_area", names_template)
  ttix_display("thundertix_named_tickets_area")
}

function ttix_customer_name_per_ticket_input(id, name = "") {
  let required = ttix_customer_name_is_required() ? "required" : ""

  return `
    <input
      type="text"
      class="thundertix-input thundertix_names_ticket_input"
      data-ticket-id="${id}"
      data-ticket-name="${name}"
      placeholder="Customer Name"
      ${required} />`
}

function ttix_tickets_selects() {
  return Array.from(ttix_query_selector_all(".thundertix_ticket_select"))
}

function ttix_ticket_fields_with_value() {
  return ttix_tickets_selects().filter(s => parseInt(s.value) > 0)
}

function ttix_selected_tickets_quantity() {
  let quantity = 0
  ttix_tickets_selects().forEach(select => {
    quantity += parseInt(select.value)
  })
  return quantity
}

function ttix_selected_tickets_are_under_max_ticket() {
  return ttix_selected_tickets_quantity() <= ttix_new_order_max_ticket_per_order()
}

function ttix_exceeded_limit_available_for_purchase_alert() {
  ttix_danger_alert("You exceeded the limit available for purchase. Please reduce your ticket quantity and try again.")
}

function ttix_danger_alert(text, disappear = true) {
  ttix_text("thundertix_danger_alert", text)
  ttix_show("thundertix_danger_alert")
  ttix_scroll_to("thundertix_danger_alert")
  if (disappear) setTimeout(() => ttix_hide("thundertix_danger_alert"), TIMEOUT10000)
}

function ttix_request_new_performance_order(e) {
  e.preventDefault()
  if ( ! ttix_selected_tickets_are_under_max_ticket() ) {
    return ttix_exceeded_limit_available_for_purchase_alert()
  }

  let body = ttix_get_info_new_performance_form()
  const uri = `${ttix_base_api()}/performances/orders`

  ttix_show_in_progress("thundertix_new_performance_button")
  ttix_set_checkout({})
  ttix_fetch(uri, { method: "POST", body: JSON.stringify(body) })
    .then( data => {
      ttix_set_checkout(data)
      ttix_draw_select_cc_year()
      ttix_draw_table_checkout()
      ttix_draw_checkout_optional_inputs()
      ttix_default_checked_order_opt_in()
      ttix_draw_include_me_in_mailing_list()
      ttix_draw_terms_and_conditions()
      ttix_display_donation_modal()

      let checkout_form = ttix_get_element_by_id("thundertix_checkout_form")
      checkout_form.reset()
      checkout_form.addEventListener("submit", ttix_request_checkout_order)

      let coupons_form = ttix_get_element_by_id("thundertix_coupons_form")
      coupons_form.reset()
      coupons_form.addEventListener("submit", ttix_request_apply_coupon)

      ttix_hide_in_progress("thundertix_new_performance_button", "Continue")
      ttix_show_section(DISPLAY_CHECKOUT)
    })
    .then(() => ttix_request_countries())
}

function ttix_request_countries() {
  if ( ttix_has_countries_loaded() ) return
  ttix_disabled("thundertix_order_billing_country", true)
  const uri = `${ttix_base_api()}/countries`

  ttix_fetch(uri)
    .then(countries => {
      ttix_countries(countries)
      ttix_text("thundertix_order_billing_country", ttix_draw_billing_country_options());
      ttix_disabled("thundertix_order_billing_country", false)
    })
    .then(() => ttix_request_states())
}

function ttix_draw_billing_country_options() {
  let countries = ttix_countries()
  if (!ttix_is_array(countries)) return;

  let options = ""
  countries.map( ({code, name}) => {
    options += `<option value="${code}">${name}</option>`
  })

  return options
}

function ttix_request_states(event) {
  const country_code = event ? event.target.value : "us"
  const uri = `${ttix_base_api()}/subregions/${country_code}`

  ttix_disabled("thundertix_order_billing_state", true)
  ttix_fetch(uri)
    .then(states => {
      let options = ttix_draw_billing_state_options(states)
      ttix_text("thundertix_order_billing_state", options);
      ttix_disabled("thundertix_order_billing_state", false)
    })
}

function ttix_draw_billing_state_options(states) {
  if (!ttix_is_array(states)) return;

  let options = ""
  states.map( state => {
    options += `<option value="${ttix_obj_key(state)}">${ttix_obj_value(state)}</option>`
  })

  return options
}

function ttix_draw_table_checkout() {
  ttix_draw_items_checkout()
  ttix_draw_tax_checkout()
  ttix_draw_total_checkout()
  ttix_draw_shipping_fee_checkout()
}

function ttix_order_items() {
  let order_tickets   = ttix_checkout_reduced_tickets()
  let order_donations = ttix_checkout_reduced_donations()
  let order_products  = ttix_checkout_reduced_products()
  let order_coupons   = ttix_checkout_reduced_coupons()

  return [
    ...order_tickets,
    ...order_donations,
    ...order_products,
    ...order_coupons,
  ]
}

function ttix_draw_items_checkout() {
  const order_items = ttix_order_items()
  if ( ! order_items.length ) { return }

  let subtotal = 0
  let items_template = ""

  order_items.map( ({ quantity, price, name, customer_name, seat_name }) => {
    let total_per_item = quantity * parseFloat(price)
    subtotal += total_per_item

    items_template += `
      <tr>
        <td>${quantity}</td>
        <td class="thundertix-price-${ttix_price_color(price)}">
          ${ttix_format_price(price)}
        </td>
        <td>${ttix_item_name(name, customer_name, seat_name)}</td>
        <td class="thundertix-price-${ttix_price_color(total_per_item)}">
          ${ttix_format_price(total_per_item)}
        </td>
      </tr>
    `
  })


  ttix_text("thundertix_checkout_items_area", items_template)
  ttix_text(
    "thundertix_checkout_subtotal",
    `<strong>${ttix_format_price(subtotal)}</strong>`
  )
}

function ttix_item_name(name, customer_name, seat_name) {
  let customer = customer_name ? customer_name : ""
  let seat = seat_name ? ` - ${seat_name}` : ""
  return `${name} ${customer} : ${ttix_checkout_order_display_name()} ${seat}`
}

function ttix_draw_tax_checkout() {
  let tax = ttix_checkout_order_sales_tax()
  if ( ! tax ) return

  ttix_text("thundertix_checkout_tax", ttix_format_price(tax))
  ttix_display("thundertix_checkout_tax_area", "table-row")
}

function ttix_draw_total_checkout() {
  let amount = ttix_checkout_order_amount()
  ttix_text(
    "thundertix_checkout_total",
    `<strong>${ttix_format_price(amount)}</strong>`
  )
}

function ttix_order_fee_items() {
  let order_shippings = ttix_checkout_reduced_shippings()
  let order_fees      = ttix_checkout_reduced_fees()

  ttix_remove_fee_items()

  return [ ...order_shippings, ...order_fees ]
}

function ttix_draw_shipping_fee_checkout() {
  const fee_items = ttix_order_fee_items()
  if ( ! fee_items.length ) { return }

  fee_items.map( (item, index) => {
    let template = ""

    if (item.quantity) {
      template = ttix_fee_template(item)
    } else {
      template = ttix_shipping_template(item)
    }

    let tr_base = ttix_get_element_by_id("thundertix_checkout_base")
    let parent  = tr_base.parentNode
    let tr      = tr_base.cloneNode(true)

    tr.id            = `thundertix_order_shipping_fee_${index}`
    tr.innerHTML     = template
    tr.style.display = "table-row"

    parent.insertBefore(tr, tr_base)
  })
}

function ttix_fee_template({ quantity, amount, name, waive_fee }) {
  let amount_per_fee = quantity * amount

  return `
    <td>${quantity}</td>
    <td>${ttix_format_price(amount)}</td>
    <td align="left">${name} ${ttix_waived(waive_fee)}</td>
    <td>${ttix_format_price(amount_per_fee)}</td>
  `
}

function ttix_shipping_template({ name, amount, waive_fee }) {
  return `
    <td colspan="2"></td>
    <td align="left">${name} ${ttix_waived(waive_fee)}</td>
    <td>${ttix_format_price(amount)}</td>
  `
}

function ttix_waived(waived) {
  return waived ?
    `<span style="color: green; font-weight: bold;">(waived)</span>` : ""
}

function ttix_draw_checkout_optional_inputs() {
  if ( ttix_checkout_hide_phone() ) {
    let phone = ttix_get_element_by_id("thundertix_order_phone")
    phone.removeAttribute("required")
    phone.classList.remove("thundertix-input")
    phone.classList.add("thundertix_display_none")
  }

  if ( ttix_checkout_hide_company_name() ) {
    let company = ttix_get_element_by_id("thundertix_order_company_name")
    company.classList.remove("thundertix-input")
    company.classList.add("thundertix_display_none")
  }

  if ( ttix_checkout_hide_billing() ) {
    ttix_get_element_by_id("thundertix_order_billing_address_1").removeAttribute("required")
    ttix_get_element_by_id("thundertix_order_billing_city").removeAttribute("required")
    ttix_get_element_by_id("thundertix_order_billing_country").removeAttribute("required")
    ttix_get_element_by_id("thundertix_order_billing_state").removeAttribute("required")
    ttix_get_element_by_id("thundertix_order_billing_zip").removeAttribute("required")

    ttix_display("thundertix_billing_inputs", "none")
  }

  if ( ttix_checkout_hide_ship() ) {
    ttix_display("thundertix_shipping_inputs", "none")
  }
}

function ttix_draw_include_me_in_mailing_list() {
  const name = ttix_checkout_name()
  let text = "Yes, please include me in the mailing list."
  if (name) text = `Yes, please include me in the ${name} mailing list.`

  ttix_text("thundertix_include_me_in_mailing_list", text)
}

function ttix_draw_terms_and_conditions() {
  const policy = ttix_checkout_policy()
  if ( ! policy ) return

  const name = ttix_checkout_name()
  let i_agree = `I agree to ${name}'s Policies displayed below`
  let terms_and_conditions = ""

  if ( ! ttix_checkout_whitelabel() ) {
    terms_and_conditions = `
      , all
      <a href="https://www.thundertix.com/purchase-terms-conditions" target="_blank">
        Terms and Conditions
      </a>
      and the
      <a href="https://www.thundertix.com/privacy-policy" target="_blank">
        Privacy Policy
      </a>
    `
  }

  ttix_text("thundertix_policy_one", `${i_agree}${terms_and_conditions}`)
  ttix_text(
    "thundertix_policy_two",
    `<h4>${name} Policies</h4><div class="thundertix-policy">${policy}</div>`
  )

  ttix_display("thundertix_policy_area", "block")
}

function ttix_display_donation_modal() {
  if ( ! ttix_ask_for_donation() ) return;
  let name          = ttix_checkout_name()
  let amount        = ttix_checkout_order_amount()
  let total_rounded = ttix_checkout_order_total_rounded()

  let wrapper = ttix_get_element_by_id("thundertix_donor_rounding_modal")
  let donation = parseFloat(total_rounded) - parseFloat(amount)
  let text = `
  <div class="thundertix-padding-5-p">
    <p class="thundertix-font-size-25-px thundertix-color-blue">Support ${name} with a donation</p>
    <p class="thundertix-font-size-20-px">
      Would you like to round up your order to ${ttix_format_price(total_rounded)} to include a donation of ${ttix_format_price(donation)}
    </p>
  </div>`

  ttix_text("thundertix_donation_text", text)
  ttix_add_donor_rounding_listener()
  wrapper.style.display = "block"
}

function ttix_add_donor_rounding_listener() {
  let donation_form = ttix_get_element_by_id("thundertix_donor_rounding_form")
  donation_form.reset()
  donation_form.addEventListener("submit", ttix_request_rounding_donation)
}

function ttix_ask_for_donation() {
  return ttix_new_order_has_donation() &&
    ttix_checkout_order_total_rounded() &&
    !ttix_checkout_donations().length
}

function ttix_copy_billing_info() {
  let copy = ttix_get_element_by_id("thundertix_order_copy_billing_info")

  let shipping_to_name   = ttix_get_element_by_id("thundertix_order_shipping_to_name")
  let shipping_address_1 = ttix_get_element_by_id("thundertix_order_shipping_address_1")
  let shipping_address_2 = ttix_get_element_by_id("thundertix_order_shipping_address_2")
  let shipping_city      = ttix_get_element_by_id("thundertix_order_shipping_city")
  let shipping_country   = ttix_get_element_by_id("thundertix_order_shipping_country")
  let shipping_state     = ttix_get_element_by_id("thundertix_order_shipping_state")
  let shipping_zip       = ttix_get_element_by_id("thundertix_order_shipping_zip")

  if ( copy.checked ) {
    let fname = ttix_get_element_by_id("thundertix_cc_fname").value
    let lname = ttix_get_element_by_id("thundertix_cc_lname").value

    shipping_to_name.value   = lname ? `${fname} ${lname}` : fname
    shipping_address_1.value = ttix_get_value("thundertix_order_billing_address_1")
    shipping_address_2.value = ttix_get_value("thundertix_order_billing_address_2")
    shipping_city.value      = ttix_get_value("thundertix_order_billing_city")
    shipping_country.value   = ttix_get_value("thundertix_order_billing_country")
    shipping_state.value     = ttix_get_value("thundertix_order_billing_state")
    shipping_zip.value       = ttix_get_value("thundertix_order_billing_zip")
  } else {
    shipping_to_name.value   = ""
    shipping_address_1.value = ""
    shipping_address_2.value = ""
    shipping_city.value      = ""
    shipping_country.value   = ""
    shipping_state.value     = ""
    shipping_zip.value       = ""
  }
}

function ttix_remove_fee_items() {
  let fee_items = ttix_query_selector_all("[id^='thundertix_order_shipping_fee_']")
  if ( ! fee_items.length ) { return }

  for ( let i = 0; i < fee_items.length; i++) {
    fee_items[i].remove()
  }
}

function ttix_draw_select_cc_year() {
  let select_template = ""

  select_template += `
    <select id="thundertix_date_year" class="thundertix-select thundertix-width-100" required>
      ${ttix_options_year()}
    </select>
  `

  ttix_text("thundertix_date_year_area", select_template)
}

function ttix_request_checkout_order(e) {
  e.preventDefault()

  const id  = ttix_checkout_order_id()
  let data  = ttix_get_info_checkout_form()
  const uri = `${ttix_base_api()}/orders/${id}/purchase`

  ttix_hide("thundertix_danger_alert")
  ttix_show_in_progress("thundertix_confirm_order_button")
  ttix_fetch(uri, { method: "PUT", body: JSON.stringify(data) })
    .then( data => {
      if (ttix_is_error(data)) return
      ttix_set_thank_you(data)
      ttix_draw_thank_you_message()
      ttix_show_section(DISPLAY_THANK_YOU)
    })
}

function ttix_draw_thank_you_message() {
  if ( ! ttix_thank_you_title() ) return
  ttix_text("thundertix_thank_you_message", ttix_thank_you_title())

  if ( ttix_thank_you_receipt_number() ) {
    ttix_text(
      "thundertix_thank_you_receipt_number",
      `<h2>${ttix_thank_you_receipt_number()}</h2>

      <p>An order confirmation receipt was sent to your email address.</p>
      <p>If you do not receive your email, please check your spam filter.</p>`
    )
  }
}

function ttix_get_info_checkout_form() {
  const id             = ttix_checkout_order_id()
  const payment_method = ttix_checkout_order_payment_method()
  const opt_in         = ttix_checkout_order_opt_in()

  let data = {
    order_id: id,
    payment_type: payment_method,
    email: "",
    cc: {
      fname: "",
      lname: "",
      number: "",
      cvv: "",
    },
    order: {
      phone: "",
      company_name: "",
      billing_address_1: "",
      billing_address_2: "",
      billing_city: "",
      billing_country: "",
      billing_state: "",
      billing_zip: "",
      shipping_to_name: "",
      shipping_address_1: "",
      shipping_address_2: "",
      shipping_city: "",
      shipping_country: "",
      shipping_state: "",
      shipping_zip: "",
      comments: "",
      opt_in
    },
    date: {
      month: "",
      year: "",
    }
  }

  data.email                    = ttix_get_value("thundertix_email")
  data.cc.fname                 = ttix_get_value("thundertix_cc_fname")
  data.cc.lname                 = ttix_get_value("thundertix_cc_lname")
  data.cc.number                = ttix_get_value("thundertix_cc_number")
  data.cc.cvv                   = ttix_get_value("thundertix_cc_cvv")

  data.order.phone              = ttix_get_value("thundertix_order_phone")
  data.order.company_name       = ttix_get_value("thundertix_order_company_name")

  data.order.billing_address_1  = ttix_get_value("thundertix_order_billing_address_1")
  data.order.billing_address_2  = ttix_get_value("thundertix_order_billing_address_2")
  data.order.billing_city       = ttix_get_value("thundertix_order_billing_city")
  data.order.billing_country    = ttix_get_value("thundertix_order_billing_country")
  data.order.billing_state      = ttix_get_value("thundertix_order_billing_state")
  data.order.billing_zip        = ttix_get_value("thundertix_order_billing_zip")

  data.order.shipping_to_name   = ttix_get_value("thundertix_order_shipping_to_name")
  data.order.shipping_address_1 = ttix_get_value("thundertix_order_shipping_address_1")
  data.order.shipping_address_2 = ttix_get_value("thundertix_order_shipping_address_2")
  data.order.shipping_city      = ttix_get_value("thundertix_order_shipping_city")
  data.order.shipping_country   = ttix_get_value("thundertix_order_shipping_country")
  data.order.shipping_state     = ttix_get_value("thundertix_order_shipping_state")
  data.order.shipping_zip       = ttix_get_value("thundertix_order_shipping_zip")
  data.order.comments           = ttix_get_value("thundertix_order_comments")
  data.order.opt_in             = ttix_get_value("thundertix_order_opt_in")

  data.date.month               = ttix_get_value("thundertix_date_month")
  data.date.year                = ttix_get_value("thundertix_date_year")

  return data
}

function ttix_request_apply_coupon(e) {
  e.preventDefault()
  const id     = ttix_checkout_order_id()
  const coupon = ttix_get_value("thundertix_coupon_input")
  if (!coupon) return
  const uri    = `${ttix_base_api()}/orders/${id}/validate_codes/${coupon}`

  ttix_hide("thundertix_danger_alert")
  ttix_show_in_progress("thundertix_coupon_button")
  ttix_set_checkout({})
  ttix_fetch(uri, { method: "POST" })
    .then( data => {
      ttix_set_checkout(data)
      ttix_scroll_to("thundertix_checkout_section")
      ttix_draw_table_checkout()
      ttix_draw_coupons_message()
      ttix_hide_in_progress("thundertix_coupon_button", "Apply")
    })
}

function ttix_draw_coupons_message() {
  ttix_text("thundertix_coupons_message", ttix_checkout_message())
  ttix_show("thundertix_coupons_message")

  setTimeout(() => ttix_hide("thundertix_coupons_message"), TIMEOUT10000)
}

function ttix_request_rounding_donation(e) {
  e.preventDefault()
  const id  = ttix_checkout_order_id()
  const uri = `${ttix_base_api()}/orders/${id}/rounding_donation`

  ttix_show_in_progress("thundertix_donor_rounding_button")
  ttix_set_checkout({})
  ttix_fetch(uri, { method: "POST" })
    .then(data => {
      ttix_set_checkout(data)
      ttix_scroll_to("thundertix_checkout_section")
      ttix_draw_table_checkout()
      ttix_hide_in_progress("thundertix_donor_rounding_button", "Absolutely!")
      let wrapper = ttix_get_element_by_id("thundertix_donor_rounding_modal")
      wrapper.style.display = "none"
    })
}

function ttix_default_checked_order_opt_in() {
  ttix_get_element_by_id("thundertix_order_opt_in").defaultChecked = true
  ttix_get_element_by_id("thundertix_order_opt_in").value = 1
}

function ttix_toggle_opt_in() {
  let opt_in = ttix_get_element_by_id("thundertix_order_opt_in")
  opt_in.checked === true ? opt_in.value = 1 : opt_in.value = 0
}

function ttix_cancel_order() {
  let wrapper = ttix_get_element_by_id("thundertix_cancel_order_modal")
  wrapper.style.display = "block"
}

function ttix_request_cancel_order() {
  const id  = ttix_checkout_order_id()
  const uri = `${ttix_base_api()}/orders/${id}/cancel`

  ttix_show_in_progress("thundertix_cancel_order_button_modal")
  ttix_show_in_progress("thundertix_cancel_order_button")
  ttix_fetch(uri, { method: "POST" })
    .then( data => {
      ttix_init_the_sales_process()
      ttix_danger_alert(data.message)
      ttix_hide_in_progress("thundertix_cancel_order_button_modal", "Cancel Order")
      ttix_hide_in_progress("thundertix_cancel_order_button", "CANCEL ORDER")
    })
}

function ttix_get_info_new_performance_form() {
  let order = {
    performance_id: ttix_performance_id(),
    shipping: "",
    products: {},
    product_options: {},
    donation: {
      campaign_id: "",
      price: "",
    },
  }

  if (ttix_is_selling_saleable_seats()) {
    order.ticket_types = {}
    ttix_saleable_seat_ticket_selects().forEach( ticket => {
      order.ticket_types[`${ticket.dataset.saleableSeatId}`] = ticket.dataset.ticketId
    })
  } else {
    order.tickets = {}
    ttix_tickets_selects().forEach( ticket => {
      order.tickets[ticket.dataset.ticketId] = ticket.value
    })
  }

  let products_selects = ttix_query_selector_all("[id^='thundertix_products_select_']")
  products_selects.forEach( product => {
    order.products[product.dataset.productId] = product.value

    if ( parseInt(product.dataset.productHasOptions) ) {
      order.product_options[product.dataset.productId] = {}
    }
  })

  let products_areas = ttix_query_selector_all("[id^='thundertix_product_area_']")
  products_areas.forEach( area => {
    let selects = area.getElementsByTagName("select")

    for (let i = 0; i < selects.length; i++) {
      let select = selects[i]

      if ( select.hasAttribute("data-product-option-id") ) {
        let product_option = order.product_options[select.dataset.productId]
        product_option[select.dataset.productOptionId] = select.value
      }
    }
  })

  let cloned_areas = ttix_query_selector_all("[id^='thundertix_product_cloned_']")
  cloned_areas.forEach( area => {
    let selects = area.getElementsByTagName("select")

    for (let i = 0; i < selects.length; i++) {
      let select = selects[i]
      if ( select.hasAttribute("data-product-option-id") ) {
        let product_option = order.product_options[select.dataset.productId]
        product_option[select.dataset.productOptionId] = select.value
      }
    }
  })

  let shipping = ttix_get_element_by_id("thundertix_shipping_select")
  order.shipping = shipping ? shipping.value : ""

  let names_tickets_inputs = ttix_get_elements_by_class_name("thundertix_names_ticket_input")
  if (names_tickets_inputs) {
    for (let i = 0; i < names_tickets_inputs.length; i++) {
      let id = names_tickets_inputs[i].dataset.ticketId
      order[`tickets_${id}`] = []
    }

    for (let i = 0; i < names_tickets_inputs.length; i++) {
      let id = names_tickets_inputs[i].dataset.ticketId
      order[`tickets_${id}`].push(names_tickets_inputs[i].value)
    }
  }

  let poll_id = ttix_get_element_by_id("thundertix_poll_id_input")
  if (poll_id) {
    order.answer = { poll_id: poll_id.value, order_id: "" }
    let answers = ttix_query_selector_all("[id^='thundertix_answer_a']")
    answers.forEach( (answer_picked, index) => {
      order.answer[`a${index + 1}`] = answer_picked.value
    })
  }

  let campaign_id = ttix_get_element_by_id("thundertix_donation_campaign_id")
  if (campaign_id) {
    order.donation.campaign_id = campaign_id.value
  }
  let donation_price = ttix_get_element_by_id("thundertix_donation_price")
  if (donation_price) {
    order.donation.price = donation_price.value
  }

  return order
}

function ttix_should_request_a_customer_name() {
  if (ttix_not_collect_the_customer_name()) return
  ttix_draw_named_tickets_area()
}

function ttix_not_collect_the_customer_name() {
  return ttix_new_order_require_names() == NAMED_IS_NOT_REQUIRED
}

function ttix_customer_name_is_required() {
  return ttix_new_order_require_names() == NAMED_IS_REQUIRED
}

function ttix_answer_input(index, required) {
  return `
    <input type="text" id="thundertix_answer_a${index}_input" ${required} />
  `
}

function ttix_answer_select(index, required, options) {
  return `
    <select id="thundertix_answer_a${index}_dropdown" class="thundertix-select" ${required}>
      <option value="">Select</option>
      ${options}
    </select>
  `
}

function ttix_product_options_select(options) {
  if ( ! options.length ) return ""

  let options_template = ""
  options.map( ({ id, product_id, group, name }) => {
    options_template += `
      <select
        id="thundertix_product_option_select_${id}"
        data-product-id="${product_id}-a"
        data-product-option-id="${id}-a"
        class="thundertix_main_product_${product_id} thundertix-select thundertix-margin-bottom-5">
        <option value="">Select ${group}</options>
        ${ttix_options_dropdown(name)}
      </select>
    `
  })

  return options_template
}

function ttix_verify_product_quantity(id) {
  let select  = ttix_get_element_by_id(`thundertix_products_select_${id}`)
  let button  = ttix_get_element_by_id(`thundertix_clone_product_button_${id}`)
  let options = ttix_query_selector_all(`.thundertix_main_product_${id}`)

  if ( parseInt(select.value) ) {
    if (options.length) {
      options.forEach((opt) => opt.required = true)
      button.classList.add("thundertix-button")
      button.classList.remove("thundertix_display_none")
    }
  } else {
    if (options.length) {
      options.forEach((opt) => opt.removeAttribute("required"))
      button.classList.remove("thundertix-button")
      button.classList.add("thundertix_display_none")
    }
  }
}

function ttix_clone_product(id) {
  let product_area = ttix_get_element_by_id(`thundertix_product_area_${id}`)
  let parent = product_area.parentNode
  let new_product_area = product_area.cloneNode(true)

  let cloned_id = `thundertix_product_cloned_${id}`
  new_product_area.id = cloned_id

  let clone_button = new_product_area.getElementsByTagName("button")[0]
  clone_button.style.display = "none"

  let options = new_product_area.getElementsByTagName("select")
  for (let i = 0; i < options.length; i++) {
    options[i].required = false
  }

  parent.insertBefore(new_product_area, product_area)

  ttix_set_cloned_product_id(`[id^=${cloned_id}]`)
}

function ttix_set_cloned_product_id(query) {
  let cloned_areas = ttix_query_selector_all(query)

  cloned_areas.forEach( (area, index) => {
    let selects = area.getElementsByTagName("select")

    for (let i = 0; i < selects.length; i++) {
      let select = selects[i]
      let product_id = ttix_set_next_product_id(select.dataset.productId, index)
      select.dataset.productId = product_id

      if ( select.hasAttribute("data-product-option-id") ) {
        let option_id = ttix_set_next_product_id(select.dataset.productOptionId, index)
        select.dataset.productOptionId = option_id
      }
    }
  })
}

function ttix_set_next_product_id(id, index) {
  return `${id.split("-")[0]}-${index + 1}`
}

function ttix_options_dropdown(options) {
  let dropdown = options.split(/\r?\n/)
  let dropdown_template = ""

  dropdown.map( text => {
    dropdown_template += `<option value="${text}">${text}</option>`
  })

  return dropdown_template
}

function ttix_options_shipping(shippings) {
  let options_shipping = ""

  if (shippings.length === 1) {
    options_shipping += `
      <option value="${shippings[0].id}">
        ${shippings[0].name} - ${ttix_format_price(shippings[0].amount)}
      </option>`
  } else {
    options_shipping += `<option value="">Select a Shipping Option</option>`
    shippings.map( ({ id, name, amount }) => {
      options_shipping += `
        <option value="${id}">
          ${name} - ${ttix_format_price(amount)}
        </option>
      `
    })
  }

  return options_shipping
}

function ttix_options_products(number) {
  let options = ""

  for ( let i = 0; i <= number; i++ ) {
    options += `<option value="${i}">${i}</option>`
  }

  return options
}

function ttix_options_year() {
  const TWENTY_YEARS     = 20
  let options            = ""
  let current_year       = new Date().getFullYear()
  let year               = current_year
  let twenty_years_later = current_year + TWENTY_YEARS

  for(; year <= twenty_years_later; year++) {
    let is_selected = current_year === year ? "selected" : ""
    options += `<option value="${year}" ${is_selected} required>${year}</option>`
  }

  return options
}

function ttix_options_campaigns(select, options) {
  options.forEach(function({ id, name, description }) {
    let option = ttix_create_element("option", {
      value: id,
      "data-description": description,
    })
    option.text = name
    select.add(option)
  })
}

function ttix_tickets_select_options(ticket) {
  let seating = ttix_available_seats(ticket)

  if ( seating < 1 ) {
    return `<span class="thundertix-sold-out">SOLD OUT</span>`
  }

  let select = `
    <select
      id="thundertix_tickets_select_${ticket.id}"
      onchange="ttix_should_request_a_customer_name()"
      data-ticket-id="${ticket.id}"
      data-ticket-name="${ticket.name}"
      class="thundertix-select thundertix_ticket_select">`

  for (let i = 0; i <= seating; i++) {
    select += `<option value="${i}">${i}</option>`
  }
  select += `</select>`

  return select
}

function ttix_return_to_section(section) {
  ttix_show("new_performance_loading")
  ttix_show("seating_chart_loading")

  ttix_reset_data()

  window.history.pushState({}, "", "")
  window.onpopstate = function() {
    ttix_show_section(section)
  }
}

function ttix_display_performances_modal() {
  let wrapper = ttix_get_element_by_id("thundertix_wrapper_modal")
  wrapper.style.display = "block"

  ttix_dismiss_modal(wrapper)
}

function ttix_close_performances_modal() {
  ttix_display("thundertix_wrapper_modal", "none")
}

function is_ttix_embed() {
  return thundertix_embed === "true" ? true : false
}

function ttix_close_performances_modal_if_is_open() {
  if ( ! is_ttix_embed() ) {
    ttix_close_performances_modal()
  }
}

function ttix_display_performances_view() {
  if ( ttix_performance_is_single() ) return DISPLAY_EVENTS

  return is_ttix_embed() ? DISPLAY_PERFORMANCES_EMBED : DISPLAY_PERFORMANCES_MODAL
}

function ttix_redirect_or_display_new_order() {
  ttix_event_seating_chart() ?
    ttix_show_section(DISPLAY_SEATING_CHART) :
    ttix_show_section(DISPLAY_NEW_ORDER)
}

function ttix_format_date(time) {
  let date = new Date(time)
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }

  return date.toLocaleDateString("en-US", options)
}

function ttix_format_price(number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "usd",
    minimumFractionDigits: 2
  })

  return formatter.format(number)
}

function ttix_price_color(number) {
  return parseFloat(number) > 0 ? "inherit" : "red"
}

function ttix_available_seats(ticket) {
  let number = 0

  if (ticket.maxcap) {
    number = (ticket.maxcap - ttix_sold_out_quantity_by_ticket(ticket.id))
  } else {
    number = (ttix_new_order_available_seats() - ttix_sold_out_total_quantity())
  }

  if ( ticket.max_per_order && number > ticket.max_per_order ) {
    number = ticket.max_per_order
  }

  if ( ticket.max_ticket_selector && number > ticket.max_ticket_selector ) {
    number = ticket.max_ticket_selector
  }

  return number
}

function ttix_sold_out_quantity_by_ticket(id) {
  let sold_out_tickets = ttix_sold_out_tickets()
  let sold_out_quantity = 0

  sold_out_tickets.map( ({ ticket_type_id, quantity }) => {
    if ( ticket_type_id === id ) {
      sold_out_quantity = quantity
    }
  })

  return sold_out_quantity
}

function ttix_sold_out_total_quantity() {
  let tickets = ttix_sold_out_tickets()
  return tickets.reduce((total, { quantity }) => total + quantity, 0)
}

function ttix_sold_out_tickets() {
  let items = ttix_new_order_tickets_sold_or_hold()
  if ( ! items || ! items.length ) return []

  // TODO: Sometimes the API returns the key 'order_item' or 'ticket'
  // https://admin.thunderstage.com/orders/new.json?performance_id=1795039
  // This is a temporal fix
  let reduced_items = null
  if (items[0].hasOwnProperty("order_item")) {
    reduced_items = ttix_reduce_object(items, "order_item")
  } else {
    reduced_items = ttix_reduce_object(items, "ticket")
  }

  let grouped_by_type_id = ttix_group_by(reduced_items, "ticket_type_id")

  return ttix_sum_quantity(grouped_by_type_id)
}

function ttix_reduce_object(items, property) {
  let collection = []
  items.forEach( item => {
    collection.push(item[property])
  })

  return collection
}

function ttix_group_by(collection, property) {
  let i = 0, val, index, values = [], result = []
  for (; i < collection.length; i++) {
    val = collection[i][property]
    index = values.indexOf(val)
    if (index > -1)
      result[index].push(collection[i])
    else {
      values.push(val)
      result.push([collection[i]])
    }
  }

  return result
}

function ttix_sum_quantity(items) {
  let sold_out = []

  items.forEach( item => {
    let quantity = item.reduce((accumulator, {quantity}) =>  accumulator + quantity, 0 )

    sold_out.push({
      id: item[0].id,
      quantity,
      performance_id: item[0].performance_id,
      ticket_type_id: item[0].ticket_type_id
    })
  })

  return sold_out
}

function ttix_modals() {
  return Array.from(ttix_query_selector_all(".wrapper-modal"))
}

function ttix_close_modal() {
  ttix_modals().forEach(function(modal) {
    modal.style.display = "none"
  })
}

function ttix_dismiss_modal(modal) {
  window.onclick = function(event) {
    if ( event.target == modal ) {
      modal.style.display = "none"
    }
  }
}

function ttix_by_visible(element) {
  return element.hide !== true
}

function ttix_is_not_private(element) {
  return element.is_private === false
}

function ttix_is_public(element) {
  return element.is_public === true
}

function ttix_get_element_by_id(id) {
  return document.getElementById(id)
}

function ttix_get_elements_by_class_name(class_name) {
  return document.getElementsByClassName(class_name)
}

function ttix_query_selector_all(query) {
  return document.querySelectorAll(query)
}

function ttix_scroll_to(id) {
  let el = ttix_get_element_by_id(id)
  window.scrollTo(el.offsetLeft, el.offsetTop)
}

async function ttix_fetch(uri, options) {
  try {
    const response = await fetch(uri, ttix_params(options))
    const data = await response.json()
    console.log(data)

    if (ttix_has_error_status(data)) return ttix_error_manager(data)

    return data
  } catch(err) {
    console.log("catch error")
    console.log(err)
    return ttix_init_the_sales_process()
  }
}

function ttix_has_error_status(data) {
  return data.status == "error"
}

function ttix_has_keep(data) {
  return data.keep == true
}

function ttix_error_manager(data) {
  if (ttix_has_keep(data)) return ttix_keep_errors(data)
  if (data.message) ttix_danger_alert(data.message)
  return ttix_show_section(DISPLAY_EVENTS)
}

function ttix_keep_errors(data) {
  if (data.message) ttix_danger_alert(data.message, false)
  /** this messages errors come when the credit cart is expired **/
  if (data.messages) ttix_danger_alert(data.messages[0], false)
  ttix_enabling_checkout_button()
  return null
}

function ttix_enabling_checkout_button() {
  ttix_hide_in_progress("thundertix_confirm_order_button", "Confirm Order")
}

function ttix_params(options) {
  return {
    ...options,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Expires": "Wed, 11 Jan 1984 05:00:00 GMT",
      "Cache-Control": "no-cache, must-revalidate, max-age=0",
      "Last-Modified": false,
    }
  }
}

function ttix_is_array(data) {
  return Array.isArray(data)
}

function ttix_parse_to_boolean(value) {
  return value === "true" ? true : false
}

function ttix_insert_before(new_element, sibling) {
  let parent = sibling.parentNode
  parent.insertBefore(new_element, sibling)
}

function ttix_set_value(id, value = "") {
  return ttix_get_element_by_id(id).value = value
}

function ttix_get_value(id) {
  return ttix_get_element_by_id(id).value
}

function ttix_text(id, text = "") {
  ttix_get_element_by_id(id).innerHTML = text
}

function ttix_display(id, display = "flex" ) {
  ttix_get_element_by_id(id).style.display = display
}

function ttix_show(id) {
  ttix_get_element_by_id(id).classList.remove("thundertix_display_none")
  ttix_get_element_by_id(id).classList.add("thundertix_display_block")
}

function ttix_hide(id) {
  let el = ttix_get_element_by_id(id)
  if (!el) return
  el.classList.add("thundertix_display_none")
  el.classList.remove("thundertix_display_block")
}

function ttix_create_element(element, attributes) {
  let input = document.createElement(element)

  for (let attr in attributes) {
    input.setAttribute(attr, attributes[attr])
  }

  return input
}

function ttix_remove_elements(elements) {
  if (elements.length) {
    elements.forEach(function(element) {
      element.remove()
    })
  }
}

function ttix_obj_key(obj) {
  return Object.keys(obj)[0]
}

function ttix_obj_value(obj) {
  return Object.values(obj)[0]
}

function ttix_disabled(id, disabled) {
  ttix_get_element_by_id(id).disabled = disabled
}

function ttix_reset_values() {
  thundertix = ttix_initial_values()
}

function ttix_spinner_icon() {
  return `<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`
}

function ttix_show_in_progress(id) {
  let button = ttix_get_element_by_id(id)
  if (!button) return
  button.disabled = true
  button.innerHTML = `${ttix_spinner_icon()} In Progress...`
}

function ttix_hide_in_progress(id, text = "Submit") {
  let button = ttix_get_element_by_id(id)
  if (!button) return
  button.innerHTML = text
  button.removeAttribute("disabled")
}

function ttix_event_buttons() {
  return Array.from(ttix_query_selector_all("[id^='thundertix_event_button_']"))
}

function ttix_hide_in_progress_event_buttons() {
  ttix_event_buttons().forEach((button) => {
    ttix_hide_in_progress(button.id, "BUY TICKETS")
  })
}

function ttix_init_the_sales_process() {
  ttix_reset_values()
  ttix_close_modal()
  return ttix_show_section(DISPLAY_EVENTS)
}

function ttix_array_from(element) {
  return Array.from(element)
}

function ttix_is_mobile_device() {
  return [/Mobile/i, /webOS/i].some((item) => navigator.userAgent.match(item))
}

function ttix_base_api() {
  return thundertix_base_api
}

function ttix_is_error(value) {
  return ttix_is_undefined(value) || ttix_is_null(value)
}

function ttix_is_undefined(value) {
  return value == undefined
}

function ttix_is_null(value) {
  return value == null
}

/* start thundertix event attributes as methods */
function ttix_event() {
  return thundertix.event
}

function ttix_set_event(data) {
  return thundertix.event = data
}

function ttix_event_id() {
  return ttix_event().id
}

function ttix_event_seating_chart() {
  return ttix_event().seating_chart
}
/* end thundertix event attributes as methods */


/* start thundertix performance attributes as methods */
function ttix_performance() {
  return thundertix.performance
}

function ttix_set_performance(data) {
  return thundertix.performance = data
}

function ttix_performance_id() {
  return thundertix.performance.id
}

function ttix_performance_name() {
  return thundertix.performance.name
}

function ttix_performance_selected_date() {
  return ttix_performance().selected_date
}

function ttix_set_performance_selected_date(date) {
  ttix_performance().selected_date = date
}

function ttix_performance_is_single() {
  return ttix_performance().is_single
}

function ttix_set_performance_is_single(value) {
  ttix_performance().is_single = value
}
/* end thundertix performance attributes as methods */


/* start thundertix saleable seats attributes as methods */
function ttix_set_saleable_seats_ids(data) {
  return thundertix.saleable_seats_ids = data
}

function ttix_saleable_seats_ids() {
  return thundertix.saleable_seats_ids
}
/* end thundertix saleable seats attributes as methods */


/* start thundertix new order attributes as methods */
function ttix_new_order() {
  return thundertix.new_order
}

function ttix_set_new_order(data) {
  return thundertix.new_order = data
}

function ttix_new_order_campaigns() {
  return ttix_new_order().campaigns
}

function ttix_new_order_reduced_campaigns() {
  return ttix_reduce_object(ttix_new_order_campaigns(), "campaign")
}

function ttix_new_order_has_donation() {
  return ttix_new_order().has_donation
}

function ttix_new_order_donation_text() {
  return ttix_new_order().donation_text
}

function ttix_new_order_saleable_seats() {
  return ttix_new_order()?.saleable_seats ?
    ttix_new_order().saleable_seats :
    []
}

function ttix_new_order_shippings() {
  return ttix_new_order().shippings
}

function ttix_new_order_reduced_shippings() {
  return ttix_reduce_object(ttix_new_order_shippings(), "shipping")
}

function ttix_new_order_require_names() {
  return ttix_new_order().require_names
}

function ttix_new_order_tickets_sold_or_hold() {
  return ttix_new_order().tickets_sold_or_hold
}

function ttix_new_order_available_seats() {
  return ttix_new_order().available_seats
}

function ttix_new_order_survey() {
  return ttix_new_order().survey
}

function ttix_new_order_survey_poll() {
  return ttix_new_order().survey.poll
}

function ttix_new_order_tickets() {
  return ttix_new_order().tickets?.filter(ttix_is_not_private)
}

function ttix_new_order_has_one_ticket() {
  return ttix_new_order_tickets().length === 1
}

function ttix_new_order_first_ticket() {
  return ttix_new_order_tickets()[0]
}

function ttix_new_order_first_ticket_price() {
  return ttix_new_order_tickets()[0].price
}

function ttix_new_order_max_ticket_per_order() {
  let tickets = ttix_new_order_tickets()
  if ( ! tickets.length ) return ttix_new_order_available_seats()
  let ticket = tickets[0]

  return ticket.max_ticket_selector ?
    ticket.max_ticket_selector :
    ttix_new_order_available_seats()
}

function ttix_new_order_products() {
  return ttix_new_order().products.filter(ttix_is_not_private)
}
/* end thundertix new order attributes as methods */


/* start thundertix checkout attributes as methods */
function ttix_checkout() {
  return thundertix.checkout
}

function ttix_set_checkout(data) {
  return thundertix.checkout = data
}

function ttix_checkout_message() {
  return ttix_checkout().message
}

function ttix_checkout_name() {
  return ttix_checkout().name
}

function ttix_checkout_shippings() {
  return ttix_checkout().shippings
}

function ttix_checkout_reduced_shippings() {
  return ttix_reduce_object(ttix_checkout_shippings(), "order_shipping")
}

function ttix_checkout_fees() {
  return ttix_checkout().fees
}

function ttix_checkout_reduced_fees() {
  return ttix_reduce_object(ttix_checkout_fees(), "order_fee")
}

function ttix_checkout_policy() {
  return ttix_checkout().policy
}

function ttix_checkout_whitelabel() {
  return ttix_checkout().whitelabel
}

function ttix_checkout_hide_ship() {
  return ttix_checkout().hide_ship
}

function ttix_checkout_hide_billing() {
  return ttix_checkout().hide_billing
}

function ttix_checkout_hide_company_name() {
  return ttix_checkout().hide_company_name
}

function ttix_checkout_hide_phone() {
  return ttix_checkout().hide_phone
}

function ttix_checkout_tickets() {
  return thundertix.checkout?.tickets ? thundertix.checkout.tickets : []
}

function ttix_checkout_reduced_tickets() {
  return ttix_reduce_object(ttix_checkout_tickets(), "ticket")
}

function ttix_checkout_donations() {
  return thundertix.checkout?.donations ? thundertix.checkout.donations : []
}

function ttix_checkout_reduced_donations() {
  return ttix_reduce_object(ttix_checkout_donations(), "donation_item")
}

function ttix_checkout_products() {
  return thundertix.checkout?.products ? thundertix.checkout.products : []
}

function ttix_checkout_reduced_products() {
  return ttix_reduce_object(ttix_checkout_products(), "product_item")
}

function ttix_checkout_coupons() {
  return thundertix.checkout?.coupons ? thundertix.checkout.coupons : []
}

function ttix_checkout_reduced_coupons() {
  return ttix_reduce_object(ttix_checkout_coupons(), "coupon_item")
}

function ttix_checkout_order_sales_tax() {
  return parseFloat(ttix_checkout().order.sales_tax)
}

function ttix_checkout_order_amount() {
  return parseFloat(ttix_checkout().order.amount)
}

function ttix_checkout_order_total_rounded() {
  return parseFloat(ttix_checkout().order.total_rounded)
}

function ttix_checkout_order_display_name() {
  return ttix_checkout().order.display_name
}

function ttix_checkout_order_id() {
  return ttix_checkout().order.id
}

function ttix_checkout_order_payment_method() {
  return ttix_checkout().order.payment_method
}

function ttix_checkout_order_opt_in() {
  return ttix_checkout().order.opt_in
}
/* end thundertix checkout attributes as methods */


/* start thundertix seating chart attributes as methods */
function ttix_seating_chart() {
  return thundertix.seating_chart
}

function ttix_set_seating_chart(data) {
  return thundertix.seating_chart = data
}

function ttix_seating_chart_svg() {
  return ttix_seating_chart().svg
}

function ttix_seating_chart_base_size() {
  return parseFloat(ttix_seating_chart().base_size)
}

function ttix_seating_chart_mobile_base_size() {
  return parseFloat(ttix_seating_chart().mobile_base_size)
}

function ttix_seating_chart_max_ticket_limit() {
  return parseFloat(ttix_seating_chart().max_ticket_limit)
}

function ttix_seating_chart_seat_name_labels() {
  return ttix_seating_chart().seat_name_labels
}
/* end thundertix seating chart attributes as methods */

/* start thundertix thank you page */
function ttix_thank_you() {
  return thundertix.thank_you
}

function ttix_set_thank_you(data) {
  return thundertix.thank_you = data
}

function ttix_thank_you_messages() {
  return ttix_thank_you().messages ?? []
}

function ttix_thank_you_title() {
  if ( ! ttix_thank_you_messages().length ) return null

  return ttix_thank_you_messages()[0]
}

function ttix_thank_you_receipt_number() {
  if ( ! ttix_thank_you_messages().length > 1 ) return null

  return ttix_thank_you_messages()[1]
}
/* end thundertix thank you page */

/*
 * thundertix countries
 * We save the countries in order to don't make another request if the
 * ticket buyer wants to choose another ticket type or does another order
 */
var _ttix_countries = []
function ttix_countries(countries) {
  if (countries === undefined) {
    return _ttix_countries
  } else {
    _ttix_countries = countries
  }
}

function ttix_has_countries_loaded() {
  return parseInt(ttix_countries().length) ? true : false
}

function ttix_is_selling_saleable_seats() {
  return ttix_event_seating_chart()
}

/* start building tables */
function baseSize() {
  return ttix_is_mobile_device() ?
    ttix_seating_chart_mobile_base_size() :
    ttix_seating_chart_base_size()
}

function ttix_seats() {
  let seats = ttix_query_selector_all(".wp-block-thundertix-events svg .seat")
  return ttix_array_from(seats)
}

function ttix_add_event_listener_to_seats() {
  ttix_seats().forEach(seat => ttix_add_event_listener_to_seat(seat))
}

function ttix_add_event_listener_to_seat(seat) {
  seat.addEventListener("click", ttix_seat_click_listener)
}

function ttix_seat_click_listener(event) {
  let seat = event.currentTarget
  if ( ! ttix_is_it_an_open_seat(seat) ) return

  ttix_add_or_remove_saleable_seats(seat)
  ttix_toggle_disabled_continue_button()
}

function ttix_is_it_an_open_seat(seat) {
  return seat.dataset.state == "open"
}

function rowSeats(row) {
  return Array.from(row.querySelectorAll(".seat"));
}

function translateX(row) {
  return parseFloat(row.dataset.x) * baseSize();
}

function translateY(row) {
  return parseFloat(row.dataset.y) * baseSize();
}

function thundertixCircularTables() {
  return Array.from(ttix_query_selector_all(".wp-block-thundertix-events svg g[data-kind='CircularTable']"))
}

function rectangularTables() {
  return Array.from(ttix_query_selector_all(".wp-block-thundertix-events svg g[data-kind='RectangularTable']"))
}

function rowsToCircularTables() {
  thundertixCircularTables().forEach(function(row) {
    makeRowAsCircularTable(row);
  });
}

function rowsToRectangularTables() {
  var tables = rectangularTables();
  if (!tables.length) return;
  for (var i = 0; i < tables.length; i ++) {
    var row = tables[i];
    makeRowAsRectangularTable(row);
  }
}

function makeRowAsCircularTable(row) {
  var seatsPositionsCircle = createCircularTablePath(row);
  var step = baseSize() * row.dataset.seatSpacing * 2;
  var seats = rowSeats(row);
  if (!seats.length) return;
  seats.forEach(function(seat) {
    var length = (seat.dataset.posInRow - 1) * step;
    var point = seatsPositionsCircle.getPointAtLength(length);

    setSeatPosition(seat, point.x, point.y);
  });
  seatsPositionsCircle.remove();
  var circleAttributes = {
    cx: 0,
    cy: 0,
    r: row.dataset.radius * baseSize() - baseSize() * 1.4,
    fill: "none",
    stroke: "black",
    "stroke-width": 1,
  };
  var tableShape = createElement("circle", circleAttributes);
  row.appendChild(tableShape);
}

function makeRowAsRectangularTable(row) {
  var width = parseFloat(row.dataset.rectangularTableWidth) * baseSize();
  var height = parseFloat(row.dataset.rectangularTableHeight) * baseSize();
  var horizontalSeatsCount = parseInt(row.dataset.rectangularTableHorizontalSeatsCount);
  var verticalSeatsCount = parseInt(row.dataset.rectangularTableVerticalSeatsCount);
  var sides = createRectangleSides(width, height);
  var rows = rowsArray(row);

  side = sides["top"];
  var seats = Array.prototype.slice.call(rows).slice(0, horizontalSeatsCount);
  var step = side.getTotalLength() / (horizontalSeatsCount + 1);
  var i = 0;
  seats.map(function(seat) {
    i ++;
    if (seat) {
      var point = side.getPointAtLength(i * step);
      setSeatPosition(seat, point.x, point.y);
    }
  });
  side.remove();

  side = sides["right"];
  var seats = Array.prototype.slice.call(rows).slice(horizontalSeatsCount, horizontalSeatsCount + verticalSeatsCount);
  var step = side.getTotalLength() / (verticalSeatsCount + 1);
  var i = 0;
  seats.map(function(seat) {
    i ++;
    if (seat) {
      var point = side.getPointAtLength(i * step);
      setSeatPosition(seat, point.x, point.y);
    }
  });
  side.remove();

  side = sides["bottom"];
  var seats = Array.prototype.slice.call(rows).slice(horizontalSeatsCount + verticalSeatsCount, horizontalSeatsCount * 2 + verticalSeatsCount);
  var step = side.getTotalLength() / (horizontalSeatsCount + 1);
  var i = 0;
  seats.map(function(seat) {
    i ++;
    if (seat) {
      var point = side.getPointAtLength(i * step);
      setSeatPosition(seat, point.x, point.y);
    }
  });
  side.remove();

  side = sides["left"];
  var seats = Array.prototype.slice.call(rows).slice(horizontalSeatsCount * 2 + verticalSeatsCount, horizontalSeatsCount * 2 + verticalSeatsCount * 2);
  var step = side.getTotalLength() / (verticalSeatsCount + 1);
  var i = 0;
  seats.map(function(seat) {
    i ++;
    if (seat) {
      var point = side.getPointAtLength(i * step);
      setSeatPosition(seat, point.x, point.y);
    }
  });
  side.remove();

  var shapeWidth = width - baseSize() * 3;
  var shapeHeight = height - baseSize() * 3;
  var rectAttributes = {
    x: 0 - shapeWidth / 2,
    y: 0 - shapeHeight / 2,
    width: shapeWidth,
    height: shapeHeight,
    "stroke-width": 1,
    stroke: "black",
    fill: "none"
  };
  var tableShape = createElement("rect", rectAttributes);
  row.appendChild(tableShape);
}

function createRectangleSides(width, height) {
  var x1 = 0 - width / 2;
  var y1 = 0 - height / 2;
  var x2 = x1 + width;
  var y2 = y1;
  var d = "M " + x1 + "," + y1 + " L " + x2 + "," + y2;
  var top = createElement("path",  { d: d, stroke: "white", "stroke-width": "3", fill: "none" });

  x1 = width / 2;
  y1 = 0 - height / 2;
  x2 = x1;
  y2 = y1 + height;
  d = "M " + x1 + "," + y1 + " L " + x2 + "," + y2;
  var right = createElement("path",  { d: d, stroke: "white", "stroke-width": "3", fill: "none" });

  x1 = width / 2;
  y1 = height / 2;
  x2 = x1 - width;
  y2 = y1;
  d = "M " + x1 + "," + y1 + " L " + x2 + "," + y2;
  var bottom = createElement("path",  { d: d, stroke: "white", "stroke-width": "3", fill: "none" });

  x1 = 0 - width / 2;
  y1 = height / 2;
  x2 = x1;
  y2 = y1 - height;
  d = "M " + x1 + "," + y1 + " L " + x2 + "," + y2;
  var left = createElement("path",  { d: d, stroke: "white", "stroke-width": "3", fill: "none" });

  return { top: top, bottom: bottom, left: left, right: right };
}

function rowsArray(row) {
  var rows = Array.from(rowSeats(row));
  var maxPosInRow = Math.max.apply(Math, rows.map(function(r) { return r.dataset.posInRow; }));
  var ary = [];

  for (var i = 1; i <= maxPosInRow; i ++) {
    var r = rows.find(function (rr) { return rr.dataset.posInRow == i; });
    ary.push(r);
  }
  return ary;
}

function createCircularTablePath(row) {
  var radius = row.dataset.radius * baseSize();
  var d = "M" + radius + "," + 0 + " ";
  d += "a " + radius + "," + radius + " 0 1,1 " + ((radius * 2) * -1) + ",0";
  d += "a " + radius + "," + radius + " 0 1,1 " + (radius * 2) + ",0 ";
  var path = createElement("path", {
    transform: "translate(" + translateX(row) + " " + translateY(row) + ")",
    d: d,
    stroke: "black",
    "stroke-width": "1",
    fill: "none",
  });

  return path;
}

function setSeatPosition(seat, x, y) {
  seat.dataset.x = x;
  seat.dataset.y = y;
  var shape = seat.querySelector(".shape");
  shape.setAttribute("cx", x);
  shape.setAttribute("cy", y);
  var icon = seat.querySelector(".seat_icon");
  if (icon) {
    icon.setAttribute("x", x);
    icon.setAttribute("y", y);
  }
  icon = seat.querySelector(".block_social_distance_icon");
  if (icon) {
    icon.setAttribute("x", x);
    icon.setAttribute("y", y);
  }
}

function createElement(tag, options) {
  var el = document.createElementNS("http://www.w3.org/2000/svg", tag);

  for (option in options) {
    el.setAttribute(option, options[option]);
  }

  return el;
}
/* end building tables */

/* start building graphic elements */
  function graphicElements() {
    let query = ttix_query_selector_all(".wp-block-thundertix-events svg .graphic_element")
    return ttix_array_from(query)
  }

  function resizeGraphicElementsToMobileView() {
    graphicElements().forEach(function(ge) {
      updateGraphicElementAttributes(ge);
    });
  }

  function updateGraphicElementAttributes(ge) {
    switch(ge.dataset.type) {
      case "rect":
        updateRectangleAttributes(ge);
        break;
      case "text":
        updateTextAttributes(ge);
        break;
      case "path":
        updatePathAttributes(ge);
        break;
      case "circle":
        updateCircleAttributes(ge);
        break;
    }
  }

  function updateRectangleAttributes(rect) {
    var x = rect.dataset.x;
    var y = rect.dataset.y;
    var dataWidth = rect.dataset.width;
    var dataHeight = rect.dataset.height;
    var rotate = rect.dataset.rotate;
    var width = graphicElementTranslateWidth(dataWidth);
    var height = graphicElementTranslateHeight(dataHeight);
    var transform = graphicElementTransform(x, y, width, height, rotate);
    if (!rect.dataset.strokeWidth) { rect.dataset.strokeWidth = 0.5; }

    setGraphicElementAttributes(rect, {
      fill: rect.getAttribute("fill"),
      stroke: rect.getAttribute("stroke"),
      "stroke-width": graphicElementStrokeWidth(rect.dataset.strokeWidth),
      "data-rotate": rotate,
      "data-x": x,
      "data-y": y,
      "data-width": dataWidth,
      "data-height": dataHeight,
      width: width,
      height: height,
      transform: transform,
    });
  }

  function updateTextAttributes(text) {
    var bounding = text.getBBox();
    var width = bounding.width;
    var height = bounding.height;
    var forceMobileView = ttix_is_mobile_device()
    if (forceMobileView) {
      width = width / 2;
      height = height / 2;
    }
    var dataX = text.dataset.x;
    var dataY = text.dataset.y;
    var dataFontSize = text.dataset.fontSize;
    var rotate = text.dataset.rotate;
    var style = text.getAttribute("style");
    var fontSize = graphicElementTranslateFontSize(dataFontSize);
    var transform = graphicElementTransform(dataX, dataY, (width / 2), (height / 2), rotate);
    if (!text.dataset.strokeWidth) { text.dataset.strokeWidth = 0.2; }

    setGraphicElementAttributes(text, {
      fill: text.getAttribute("fill"),
      stroke: text.getAttribute("stroke"),
      "stroke-width": graphicElementStrokeWidth(text.dataset.strokeWidth),
      "data-rotate": rotate,
      "data-x": dataX,
      "data-y": dataY,
      "data-font-size": dataFontSize,
      "font-size": fontSize,
      style: style,
      transform: transform,
    });
  }

  function updatePathAttributes(path) {
    dots = path.dataset.pathD.split(" ");
    dots.splice(-1, 1);

    var d = "";
    dots.forEach(function(dot, index) {
      var points = dot.split(",");
      var x = points[0];
      var y = points[1];
      if (index === 0) {
        d += pointPathD(x, y, "first");
      } else if (index === dots[dots.length - 1]) {
        d += pointPathD(x, y, "last");
      } else {
        d += pointPathD(x, y, "middle");
      }
    });

    if (!path.dataset.x && !path.dataset.y) {
      path.dataset.x = 0;
      path.dataset.y = 0;
    }

    var bounding = path.getBBox();
    var transform = graphicElementTransform(
      path.dataset.x,
      path.dataset.y,
      bounding.width,
      bounding.height,
      0
    );
    setGraphicElementAttributes(path, {
      d: d,
      "stroke-width": graphicElementStrokeWidth(path.dataset.strokeWidth),
      transform: transform,
    });
  }

  function updateCircleAttributes(circle) {
    var x               = circle.dataset.x;
    var y               = circle.dataset.y;
    var dataStrokeWidth = circle.dataset.strokeWidth;
    var dataR           = circle.dataset.r;
    var dataWidth       = circle.dataset.width;
    var dataHeight      = circle.dataset.height;
    var fill            = circle.getAttribute("fill");
    var stroke          = circle.getAttribute("stroke");
    var strokeWidth     = graphicElementStrokeWidth(dataStrokeWidth);
    var radius          = graphicElementRadius(dataR);
    var width           = graphicElementTranslateWidth(dataWidth);
    var height          = graphicElementTranslateHeight(dataHeight);
    var transform       = graphicElementTransform(x, y, width, height, 0);

    setGraphicElementAttributes(circle, {
      fill: fill,
      stroke: stroke,
      "stroke-width": strokeWidth,
      r: radius,
      transform: transform,
    })
  }

  function updateCircleAttributes(circle) {
    var x               = circle.dataset.x;
    var y               = circle.dataset.y;
    var dataStrokeWidth = circle.dataset.strokeWidth;
    var dataR           = circle.dataset.r;
    var dataWidth       = circle.dataset.width;
    var dataHeight      = circle.dataset.height;
    var fill            = circle.getAttribute("fill");
    var stroke          = circle.getAttribute("stroke");
    var strokeWidth     = graphicElementStrokeWidth(dataStrokeWidth);
    var radius          = graphicElementRadius(dataR);
    var width           = graphicElementTranslateWidth(dataWidth);
    var height          = graphicElementTranslateHeight(dataHeight);
    var transform       = graphicElementTransform(x, y, width, height, 0);

    setGraphicElementAttributes(circle, {
      fill: fill,
      stroke: stroke,
      "stroke-width": strokeWidth,
      r: radius,
      transform: transform,
    })
  }

  function graphicElementTranslateX(x) {
    return parseFloat(x) * baseSize();
  }

  function graphicElementTranslateY(y) {
    return parseFloat(y) * baseSize();
  }

  function graphicElementTranslateWidth(width) {
    return parseFloat(width) * baseSize();
  }

  function graphicElementTranslateHeight(height) {
    return parseFloat(height) * baseSize();
  }

  function graphicElementTranslateFontSize(fontSize) {
    return parseFloat(fontSize) * baseSize();
  }

  function graphicElementStrokeWidth(strokeWidth) {
    return parseFloat(strokeWidth) * baseSize();
  }

  function graphicElementRadius(r) {
    return parseFloat(r) * baseSize();
  }

  function graphicElementTransform(x, y, width, height, rotate) {
    var translateX = graphicElementTranslateX(x);
    var translateY = graphicElementTranslateY(y);

    var transform = "translate(" + translateX + " " + translateY + ")";
    if (rotate != 0) transform += " rotate(" + rotate + " " + width +  " " + height + ")";
    return transform;
  }

  function setGraphicElementAttributes(el, attributes) {
    for (attr in attributes) {
      el.setAttribute(attr, attributes[attr]);
    }
  }

  function pointPathD(x, y, position) {
    var letter = "L";
    var points = "" + graphicElementTranslateX(x) + "," + graphicElementTranslateY(y) + "";

    if (position === "last") return letter + points + "Z";
    if (position === "first") letter = "M";

    return letter + points;
  }

/* end building graphic elements */

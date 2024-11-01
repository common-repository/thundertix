# Thundertix Wordpress Plugin

## Requirements

- [XAMPP (Apache, MySQL, PHP)](https://www.apachefriends.org/es/index.html)
- [WordPress](https://wordpress.org/download/)

## WordPress Installation

1. Unzip **wordpress** folder

2. Put **wordpress** folder into **htdocs** folder
   > If you are using linux mostly `/opt/lampp/htdocs/`

3.- Database configuration

1. Copy and paste `wp-config-sample.php` to `wp-config.php`
2. Use your credentials

```php
<?php

define( 'DB_NAME', 'wordpress' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );
```

4. Visit `http://localhost/wordpress`.

   > Don't forget change **wordpress** with your folder name.

5. Fill inputs like username, password, site name, etc...

## ThunderTix Plugin Installation

1. Search as **ThunderTix** and download from [wordpress store](https://wordpress.org/plugins/).

2. Unzip and paste into **Plugins** folder
   > `/htdocs/wordpress/wp-content/plugins/ttix_wordpress`

3.- Get an **Auth token** into [owner user account](https://admin.thundertix.com/users).

1. As wordpress admin, copy and paste into `Settings > ThunderTix > Token input`
2. Enter your public subdomain `https://chapulines.thundertix.com` into **Subdomain input**.
   > In this case **chapulines** is the subdomain.
3. Go to **Posts/Pages** and add a thundertix block.

4. Go to wordpress public page and see events list.

## Development mode

### Set development domain

If you want to test in local env, just set a env variable into `/opt/lampp/apache2/conf/httpd.conf`

```apache
SetEnv THUNDERTIX_DOMAIN "http://admin.lvh.me:3000
```

### Code Standards

- We must use the prefix `ttix` in every single method.
- We must set `constants` in the top of the file.
- We must use the `ttix_fetch` in order to request some data as `GET, POST, PUT, DELETE` verb.

### Run gutenberg editor script

In order to compile the gutenberg plugin (the editor wich is seen as wordpress admin).

This most be running if you make changes into `ttix_wordpress/gutenberg/src` folder

Install packages

```bash
yarn install
```

Execute it in dev mode

```bash
yarn start
```

Build to production

```bash
yarn build
```

## API ThunderTix WordPress

- [Events List](#events-list)
- [Performances List](#performances-list)
- [New Order](#new-order)
- [Create Order](#create-order)
- [Purchase Order](#purchase-order)
- [Cancel Order](#cancel-order)
- [Coupons](#coupons)
- [Subregions](#subregions)
- [Countries](#countries)
- [Rounding Donation](#rounding-donation)

ThunderTix [REST API](http://localhost/wordpress/index.php/wp-json/thundertix/v1) in local env.

### Events List

> Auth not required

```
/wp-json/thundertix/v1/events

[
  {
    "id": 8418,
    "name": "GA event with all",
    "seating_chart": false,
    "description": "Ticket type 65",
    "picture": "/system/staging-tixevent-pictures/multi/959/template3/forest.jpg?1581091041",
    "is_public": 1,
    "sold_out_message": "MY SOLD OUT",
    "created_at": "2020-02-07T09:59:43.000-06:00",
    "expires": "2020-06-30T19:00:00.000-05:00",
    "on_sale": true,
    "without_availability": false
  },
]
```

### Performances List

> Auth required

```
/wp-json/thundertix/v1/events/8414/performances

[
  {
    "id": 227566,
    "time": "2020-02-24T23:00:00.000-06:00",
    "name": "GA event with coupon",
    "available": true,
    "sold_seats": 0,
    "hide_date": false,
    "replace_date": "",
    "hide_sold_out": false,
    "sold_out_message": ""
  },
]
```

### New Order

> Auth required

```
/wp-json/thundertix/v1/performances/228135/orders/new

{
  "tickets": [
    {
      "id": 56027,
      "name": "Adult",
      "price": "50.00",
      "maxcap": null,
      "max_per_order": null,
      "description": "Adult description ticket type",
      "inactive": false,
      "is_private": false,
      "activates": null,
      "expires": null
    },
  ],
  "tickets_sold_or_hold": [],
  "available_seats": 300,
  "performance_tickets_available": 300,
  "shippings": [
    {
      "shipping": {
        "id": 9329,
        "name": "UPS",
        "amount": "10.0",
        "applies_to": "order",
        "hide": false,
        "percentage": null,
        "event_id": 8418,
        "package_id": null,
        "season_pass_id": null
      }
    },
  ],
  "products": [
    {
      "id": 146,
      "name": "Awesome Cap",
      "description": "Awesome Cap description",
      "price": 10,
      "is_private": false,
      "picture": "/system/staging-product-picture-image/146/original/564423-main.jpg?1581449035",
      "product_options": [
        {
          "id": 12,
          "name": "Red\r\nGreen\r\nBlue",
          "product_id": 146,
          "group": "colors"
        }
      ]
    },
  ],
  "survey": {
    "poll": {
      "id": 663,
      "name": "vegetarians",
      "venue_id": 563,
      "q1": "Are there any vegetarians in your party? If so, how many? ",
      "r1": false,
      "q2": "Are there any gluten free in your party? If so, how many? ",
      "r2": false,
      "q3": "",
      "r3": false,
      "q4": "",
      "r4": false,
      "q5": "",
      "r5": false,
      "active": true,
      "created_at": "2020-01-29T10:10:48.000-06:00",
      "updated_at": "2020-01-29T10:10:48.000-06:00",
      "answer_type1": "open",
      "answer_text1": "",
      "answer_type2": "dropdown",
      "answer_text2": "1\r\n5\r\n10\r\nmore\r\n",
      "answer_type3": "open",
      "answer_text3": "",
      "answer_type4": "open",
      "answer_text4": "",
      "answer_type5": "open",
      "answer_text5": "",
      "order": true,
      "collect_by_performance": false
    }
  },
  "require_names": 1,
  "has_donation": true,
  "donation_text": "Would you like to support Chapulines Inc. with a donation?",
  "campaigns": [
    {
      "campaign": {
        "id": 7,
        "name": "basic campaign",
        "active": true,
        "recurring_support": false,
        "description": "basic campaign description",
        "goal": null,
        "poll_id": null,
        "venue_id": 563,
        "email_header": "",
        "created_at": "2020-01-29T11:56:29.000-06:00",
        "updated_at": "2020-02-12T11:29:53.000-06:00",
        "picture_file_name": null,
        "picture_content_type": null,
        "picture_file_size": null,
        "picture_updated_at": null,
        "custom_message": ""
      }
    },
  ],
  "status": "created"
}
```

### Create Order

```
/wp-json/thundertix/v1/performances/orders

params: {
  "performance_id": "228135",
  "shipping": "9329",
  "tickets": {
    "56027": "3"
  }
}

{
  "order":{
    "id":1074006,
    "created_at":"2020-02-24T17:12:42.000-06:00",
    "updated_at":"2020-02-24T17:12:43.000-06:00",
    "billing_address_1":null,
    "billing_address_2":null,
    "billing_city":null,
    "billing_state":null,
    "billing_zip":null,
    "shipping_address_1":null,
    "shipping_address_2":null,
    "shipping_city":null,
    "shipping_state":null,
    "shipping_zip":null,
    "customer_id":null,
    "state":"pending",
    "description":null,
    "shipping_id":null,
    "shipping_name":null,
    "shipping_cost":"0.0",
    "lastfour":null,
    "donation_deprecated":"0.0",
    "account_id":521,
    "shipping_to_name":null,
    "user_id":2047,
    "phone":null,
    "phone_type1":null,
    "payment_method":"card",
    "comments":null,
    "customer_first_name":null,
    "customer_last_name":null,
    "customer_email":null,
    "card_type":null,
    "amount":"180.0",
    "location":null,
    "sales_tax":"0.0",
    "display_name":"GA event with all - Monday February 24, 2020 - 07:00 PM",
    "company_name":null,
    "opt_in":null,
    "facebook_sale":false,
    "ip_address":"",
    "note_id":null,
    "billing_country":null,
    "shipping_country":null,
    "print_date":null,
    "t_print_date":null,
    "shipping_hide_pdf":false,
    "ticket_document_file_name":null,
    "ticket_document_content_type":null,
    "ticket_document_file_size":null,
    "ticket_document_updated_at":null,
    "referrer":"",
    "browser":"WordPress\/5.3.2; http:\/\/localhost\/wordpress",
    "thermal_ready":null,
    "pdf_ready":null,
    "original_reserved_order_id":null,
  },
  "tickets":[{
    "ticket":{
      "id":1609086,
      "quantity":1,
      "order_id":1074006,
      "performance_id":228135,
      "price_adjustment_id":null,
      "created_at":"2020-02-24T17:12:43.000-06:00",
      "updated_at":"2020-02-24T17:12:43.000-06:00",
      "price":"50.0",
      "original_price":null,
      "name":"Adult",
      "refunded_ticket_id":null,
      "coupon_code":null,
      "ticket_type_id":56027,
      "coupon_redeemed":null,
      "saleable_seat_id":null,
      "sales_tax":"0.0",
      "package_id":null,
      "seat_name":null,
      "included_sales_tax":"0.0",
      "season_pass_id":null,
      "refund_id":null,
      "parent_id":null,
      "product_id":null,
      "refunded_product_id":null,
      "exchanged_ticket_id":null,
      "customer_name":"Name",
      "exchange_order_id":null,
      "gift_certificate_id":null,
      "gift_certificate_item_id":null,
      "campaign_id":null,
      "ticket_id":null,
      "couponed_ticket_id":null
    }
  }],
  "products":[{
    "product_item":{
      "id":1609088,
      "quantity":1,
      "order_id":1074006,
      "performance_id":228135,
      "price_adjustment_id":null,
      "created_at":"2020-02-24T17:12:43.000-06:00",
      "updated_at":"2020-02-24T17:12:43.000-06:00",
      "price":"10.0",
      "original_price":null,
      "name":"Awesome Cap - Red",
      "refunded_ticket_id":null,
      "coupon_code":null,
      "ticket_type_id":null,
      "coupon_redeemed":null,
      "saleable_seat_id":null,
      "sales_tax":"0.0",
      "package_id":null,
      "seat_name":null,
      "included_sales_tax":"0.0",
      "season_pass_id":null,
      "refund_id":null,
      "parent_id":null,
      "product_id":146,
      "refunded_product_id":null,
      "exchanged_ticket_id":null,
      "customer_name":null,
      "exchange_order_id":null,
      "gift_certificate_id":null,
      "gift_certificate_item_id":null,
      "campaign_id":null,
      "ticket_id":null,
      "couponed_ticket_id":null
    }
  }],
  "donations":[{
    "donation_item":{
      "id":1609087,
      "quantity":1,
      "order_id":1074006,
      "performance_id":228135,
      "price_adjustment_id":null,
      "created_at":"2020-02-24T17:12:43.000-06:00",
      "updated_at":"2020-02-24T17:12:43.000-06:00",
      "price":"100.0",
      "original_price":null,
      "name":"Donation : basic campaign",
      "refunded_ticket_id":null,
      "coupon_code":null,
      "ticket_type_id":null,
      "coupon_redeemed":null,
      "saleable_seat_id":null,
      "sales_tax":"0.0",
      "package_id":null,
      "seat_name":null,
      "included_sales_tax":"0.0",
      "season_pass_id":null,
      "refund_id":null,
      "parent_id":null,
      "product_id":null,
      "refunded_product_id":null,
      "exchanged_ticket_id":null,
      "customer_name":null,
      "exchange_order_id":null,
      "gift_certificate_id":null,
      "gift_certificate_item_id":null,
      "campaign_id":7,
      "ticket_id":null,
      "couponed_ticket_id":null
    }
  }],
  "shippings":[{
    "order_shipping":{
      "id":583586,
      "order_id":1074006,
      "amount":"10.0",
      "name":"UPS",
      "applies_to":"order",
      "created_at":"2020-02-24T17:12:43.000-06:00",
      "updated_at":"2020-02-24T17:12:43.000-06:00",
      "quantity":null,
      "waive_fee":null,
      "refunded":false,
      "fee_id":9329,
      "performance_id":228135
    }
  }],
  "fees":[{
    "order_fee":{
      "id":583587,
      "order_id":1074006,
      "amount":"2.0",
      "name":"Black fee",
      "applies_to":"ticket",
      "created_at":"2020-02-24T17:12:43.000-06:00",
      "updated_at":"2020-02-24T17:12:43.000-06:00",
      "quantity":1,
      "waive_fee":null,
      "refunded":false,
      "fee_id":9328,
      "performance_id":228135
    }
  }],
  "currency":"usd",
  "hide_phone":false,
  "hide_company_name":true,
  "hide_billing":false,
  "hide_ship":true,
  "name":"Chapulines Inc.",
  "policy":"Our Terms and Conditions template will get...",
  "whitelabel":false,
  "status":"created"
}

```

## Purchase Order

> Auth required

```
/wp-json/thundertix/v1/orders/1074012/purchase
params: {
  order_id: 1074012,
}

```

## Cancel Order

> Auth required

```
/wp-json/thundertix/v1/orders/1074006/cancel
params: {
  order_id: 1074006
}

{
  "message":"The order is invalid",
  "status":"error"
}

{
  "message":"Something went wrong",
  "status":"error"
}
```

## Coupons

> Auth required

```
/wp-json/thundertix/v1/orders/1074006/validate_codes/SOMECOUPON
params: {
  coupons: "SOMECOUPON"
}

```

## Subregions

> Auth not required

```
/wp-json/thundertix/v1/subregions/code
params: {
  code: "US"
}

[
  {"AK":"Alaska"},
  {"AL":"Alabama"},
  ...
]
```

## Countries

> Auth not required

```
/wp-json/thundertix/v1/countries

[
  {"code":"US","name":"United States"},
  {"code":"CA","name":"Canada"},
  ...
]
```

## Rounding Donation

> Auth required

```
/wp-json/thundertix/v1/orders/id/rounding_donation
params: {
  order_id: 1
}

// Same as order create

```

## Authors

- [ThunderTix](https://profiles.wordpress.org/thundertix/)

- [JuanVqz](https://profiles.wordpress.org/juanvqz/)

## Source

[ttix wordpress repository](https://github.com/dawngreen/ttix_wordpress)

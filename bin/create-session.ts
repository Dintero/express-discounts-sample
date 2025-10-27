#!/usr/bin/env ts-node
import { createClient } from "@dintero/node-sdk";

import * as fs from "fs";

import { parseArgs } from "util";

const args = parseArgs({
  options: {
    callback_public_hostname: {
      type: "string",
      short: "h",
    },
  },
});

if (!args.values.callback_public_hostname) {
  console.error("Error: callback_public_hostname is required.");
  process.exit(1);
}

const callbackPublicHostname = args.values.callback_public_hostname;

const credentialsPath = "credentials.json";

if (!fs.existsSync(credentialsPath)) {
  console.error(
    "Error: credentials.json not found. Please run 'yarn dintero-login' first.",
  );
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

const client = createClient({
  clientId: credentials.client_id,
  clientSecret: credentials.client_secret,
  audience: credentials.audience,
});

const sessionProfileResponse = await client.checkout.POST("/sessions-profile", {
  body: {
    profile_id: "default",
    url: {
      return_url: "http://localhost:3000/return",
    },
    order: {
      items: [
        {
          amount: 10000,
          vat_amount: 2000,
          vat: 25,
          quantity: 1,
          line_id: "l1",
          id: "item1",
        },
        {
          amount: 10000,
          vat_amount: 2000,
          vat: 25,
          quantity: 1,
          line_id: "l2",
          id: "item2",
        },
      ],
      amount: 20000,
      vat_amount: 4000,
      currency: "NOK",
      merchant_reference: "reference",
    },
    express: {
      shipping_address_callback_url: `${callbackPublicHostname}/shipping-address-callback`,
      shipping_options: [],
      discount_codes: {
        callback_url: `${callbackPublicHostname}/discount-code-callback`,
        max_count: 3,
      },
    },
    configuration: {
      discounts: {
        express_discount_codes: {
          enabled: true,
        },
      },
    },
  },
});
console.log(sessionProfileResponse);
console.log(sessionProfileResponse.data);

# Kihoko's Shop Guide 🛍

This guide explains how to run the online shop on kihoko.com. It is written so
that Kihoko (or her AI assistant) can follow it step by step — no coding needed.

The shop sells art and goods with payment by **Stripe** and shipping
**within Japan only**. Prices are always in yen.

---

## Everyday tasks

All commands are run from the `kihokosite/scripts` folder:

```bash
cd kihokosite/scripts
```

(One-time setup: copy `env.example` to `.env` and fill in the Azure values —
the same ones used by `secure-upload.js`.)

### See what's in the shop

```bash
node manage-store.js list
```

### Put a new item up for sale

```bash
node manage-store.js add --title "Cherry Blossom Print" --price 8000 \
    --image ~/Desktop/photo.jpg --stock 10 --type print \
    --description "A4 giclee print on archival paper."
```

Useful variations:
- A one-of-a-kind original: add `--one-of-a-kind` (sells out after one purchase)
- Made-to-order goods that never sell out: `--stock unlimited`
- More than one photo: repeat `--image` for each file
- Sell a picture already in the site gallery: `--image-id <gallery image id>`
  instead of `--image`

The item appears at `kihoko.com/shop` within a minute or so.

### Change a price, stock, or description

```bash
node manage-store.js update cherry-blossom-print --price 9000
node manage-store.js update cherry-blossom-print --stock 3
node manage-store.js update cherry-blossom-print --description "New text..."
```

You can refer to an item by its page name (slug) or its id.

### Sold something in person? Mark it sold

```bash
node manage-store.js sold cherry-blossom-print
```

### Hide / show an item

```bash
node manage-store.js hide cherry-blossom-print
node manage-store.js unhide cherry-blossom-print
```

### See orders that need shipping

```bash
node manage-store.js orders
```

This shows who bought what, their address and phone number. After you post the
package, mark it done:

```bash
node manage-store.js fulfill <order id>
```

### Change the shipping fee

```bash
node manage-store.js shipping --flat 1000        # ¥1,000 per order
node manage-store.js shipping --free-over 10000  # free over ¥10,000
```

---

## Money, refunds, and receipts (Stripe Dashboard)

Everything about money lives in the Stripe Dashboard:
https://dashboard.stripe.com

- **Refunds**: find the payment under "Payments" → "Refund". Stock is NOT
  automatically restored — use `manage-store.js update <item> --stock N` if the
  item should go back on sale.
- **Payouts** to the bank account: Settings → Payouts.
- **Payment methods**: Settings → Payment methods. The shop automatically
  offers whatever is enabled there — no code changes needed. (Konbini is not
  available on a US Stripe account; see "Stripe account" below.)
- Customers automatically receive email receipts from Stripe.

---

## One-time setup (for the technical helper)

### 1. Stripe account

The shop uses the existing Kihoko Stripe account (a **US account**). Two
consequences of that:

- Customers pay in yen, but payouts arrive in USD — Stripe converts at
  payout time (roughly 1–2% conversion fee).
- **Konbini / bank-transfer payment is not available** (it requires a
  Japan-registered Stripe account). Customers pay by card. If konbini ever
  becomes important, a separate JP Stripe account can be swapped in later —
  the shop code already supports its async payment flow.

### 2. Keys

From https://dashboard.stripe.com/apikeys copy the **Secret key** (`sk_live_...`
or `sk_test_...` while testing).

### 3. Webhook

The shop records orders through a webhook. In the Stripe Dashboard:

1. Developers → Webhooks → **Add endpoint**
2. URL: `https://kihoko.com/api/stripe-webhook`
3. Select exactly these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
4. Copy the endpoint's **Signing secret** (`whsec_...`).

### 4. Configure the website

In the Azure portal, open the Static Web App → **Environment variables** and add:

| Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | the secret key from step 2 |
| `STRIPE_WEBHOOK_SECRET` | the signing secret from step 3 |
| `PUBLIC_SITE_URL` | `https://kihoko.com` (used for the return-to-site links after payment) |

Optionally add the same names as GitHub secrets (the workflow passes them to
builds), and to `api/local.settings.json` for local development.

### 5. Test before going live

Use the **test-mode** keys first (`sk_test_...` + a test-mode webhook endpoint):

1. Add a test product: `node manage-store.js add --title "Test" --price 500 --image ...`
2. Buy it on the site with Stripe's test card `4242 4242 4242 4242`
   (any future expiry, any CVC, any Japanese address).
3. Check the order appears: `node manage-store.js orders`
4. Check stock went down: `node manage-store.js list`
5. Hide the test product, swap in the live keys, and do one real purchase +
   refund as a final check.

For local development, forward webhooks with the Stripe CLI:

```bash
stripe listen --forward-to http://localhost:7071/api/stripe-webhook
```

(This prints a temporary `whsec_...` — put it in `api/local.settings.json`.)

---

## How it works (for developers)

- Product and order data live in Cosmos DB (`KihokoPortfolio` / `Portfolio`)
  as documents with `type: 'product'`, `type: 'order'`, `type: 'settings'`.
- `POST /api/checkout` builds a Stripe Checkout session server-side (prices are
  never taken from the browser), JPY, shipping restricted to Japan.
- Stripe hosts the payment page; the customer returns to `/shop/success`.
- `POST /api/stripe-webhook` (signature-verified) records the order and
  adjusts stock. Konbini/bank-transfer payments arrive as *pending* and are
  confirmed by a later async event.
- One-of-a-kind race: if two people pay for the same original at nearly the
  same moment, the second payment must be refunded manually — Stripe will show
  both payments, and `orders` will show both. This is rare and acceptable at
  this scale.

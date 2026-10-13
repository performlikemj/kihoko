# Flash book — site API and book (through round 5)

Kiho’s one-off designs live in the existing Cosmos database `KihokoPortfolio`, container `Portfolio`, partitioned by `/type`. The API and uploader must use the literal partition keys below. All money is **whole Japanese yen**, never multiplied by 100. No timer or email service is used.

## Uploader contract: `flash` document

The uploader writes this complete shape directly into Cosmos (replace example UUID/blob paths with real values):

```json
{
  "id": "508a5a1a-3eaa-4c1a-a4ea-75a4553d1d53",
  "type": "flash",
  "title": "Moon garden",
  "description": "A small moon and wild flowers.",
  "blobName": "images/508a5a1a.jpg",
  "thumbnailBlobName": "thumbnails/508a5a1a.jpg",
  "width": 1200,
  "height": 1800,
  "depositJpy": 2000,
  "place": "Kyoto",
  "sizeNote": "about 8 cm",
  "priceNote": "from ¥25,000",
  "status": "available",
  "holdSessionId": null,
  "heldUntil": null,
  "claimId": null,
  "order": 0,
  "createdAt": "2026-10-13T00:00:00.000Z",
  "updatedAt": "2026-10-13T00:00:00.000Z"
}
```

| Field | Type / exact meaning |
| --- | --- |
| `id` | UUID string. Stable, unique design identity. Partition key: `flash`. |
| `type` | Literal `"flash"`. |
| `title` | Nonempty string. Used as Stripe product name `Flash deposit — <title>`; keep title within 100 characters. |
| `description` | String; use `""` if there is no description. |
| `blobName` | Original image blob path inside the existing public `media` blob container, not a full URL. |
| `thumbnailBlobName` | Thumbnail blob path; use `""` if absent (API falls back to original). |
| `width`, `height` | Positive integer original image dimensions in pixels; required to reserve image space. |
| `depositJpy` | Positive integer, default `2000` when omitted or null. Uploader should always write `2000` unless explicitly changing the deposit. |
| `place` | Optional string, at most 40 characters after trimming; where the idea came from (e.g. `"NYC"`, `"Kyoto"`, `"Lisbon"`). Omit or use `""` for no tag. The builder/API omit blank values, preserve case, and reject non-text/control characters. A missing or null legacy value is treated as blank. Plain metadata for future chapters; tattoo sessions still happen in Osaka. |
| `sizeNote`, `priceNote` | Optional strings; may be omitted or `""`. Describe the design **as drawn**, not a fixed size policy. Larger versions may cost extra, arranged directly with Kiho. Informational, never a client-side price authority; the deposit stays `depositJpy` for every requested size. |
| `status` | Exactly `"available"`, `"held"`, `"taken"`, or `"hidden"`. Upload new designs as `available` (or `hidden` until ready). |
| `holdSessionId` | String or null: `pending:<uuid>` during checkout creation; then Stripe `cs_...` session id. API-owned. |
| `heldUntil` | UTC ISO-8601 string or null. Initial hold is 33 minutes; Stripe checkout expires after 31 minutes, both measured from the request clock. API-owned. |
| `claimId` | Stripe Checkout session id string or null; set on `taken`. API-owned. |
| `order` | Finite number; ascending display order. Use distinct integers for predictable ordering. |
| `createdAt`, `updatedAt` | UTC ISO-8601 strings. Preserve creation time; update modification time. |

Cosmos supplies `_etag` and other system fields. Never generate or overwrite those fields. For updates to existing designs, the uploader must read and replace with `IfMatch` on the current `_etag`, preserve all API-owned fields, and re-read on HTTP 412. Never reset a held/taken design to available, delete a claimed design, reuse an id, or blindly overwrite state while a visitor could be paying. Hidden designs do not appear publicly. This round contains no upload endpoint or Studio claims UI.

## Booking contract: `flashClaim` document

The API writes this shape. Its `id` is also its Stripe Checkout session id; partition key is `flashClaim`.

```json
{
  "id": "cs_test_example",
  "type": "flashClaim",
  "flashId": "508a5a1a-3eaa-4c1a-a4ea-75a4553d1d53",
  "flashTitle": "Moon garden",
  "status": "pending",
  "depositJpy": 2000,
  "booking": {
    "name": "Visitor name",
    "email": "visitor@example.jp",
    "instagram": "",
    "placement": "Left forearm",
    "size": "about 8 cm",
    "skinTone": "Medium (Type III)",
    "dates": "Weekends in November",
    "notes": ""
  },
  "stripePaymentIntentId": null,
  "createdAt": "2026-10-13T00:00:00.000Z",
  "updatedAt": "2026-10-13T00:00:00.000Z",
  "paidAt": null
}
```

| Field | Type / exact meaning |
| --- | --- |
| `id` | Stripe Checkout `cs_...` session id string; no separate random claim UUID. |
| `type` | Literal `"flashClaim"`. |
| `flashId`, `flashTitle` | Strings: design id and title captured at checkout creation. |
| `status` | Exactly `"pending"`, `"paid"`, `"expired"`, or `"cancelled"`. |
| `depositJpy` | Positive integer, captured from the design document, never from the request. |
| `booking` | Object with exactly the eight string fields shown above. Optional inputs become `""`. Private to Studio/server. |
| `stripePaymentIntentId` | String or null; set from Stripe on paid completion. |
| `createdAt`, `updatedAt` | UTC ISO-8601 strings. |
| `paidAt` | UTC ISO-8601 string or null; preserve original payment timestamp on webhook redelivery. |
| `conflict` | Optional boolean `true`, only on a paid claim whose design is already taken by another claim. Retain the payment and investigate the critical server log; no automatic refund is performed. |

Booking validation trims all strings. Required: name 1–80 characters, simple email shape up to 254, placement 1–200, and request-only `agree: true`. Optional caps: Instagram 60, size 200, skinTone 60, dates 300, notes 2000. Reject all C0/C1 control characters (including tabs/newlines) **before trimming**. `agree` is validated but not stored in the booking object. Unknown request fields (including deposit amounts) are ignored.

## State machine and payment safety

All shapes, validation, pure transitions, and workflows with injected db/Stripe dependencies are in `api/shared/flash.js`. SDK access stays in the existing services and HTTP adapter.

- `available` → `held`: `IfMatch` claim before Stripe creation; retry 412 up to three attempts. Exactly one visitor creates a checkout.
- An expired `held` doc is effectively `available` on public reads without rewriting it. Invalid/missing heldUntil stays held. No Azure timer triggers. If Stripe settlement fails, log the failure and show the uncertain design as held while the rest of the public book remains readable; no hold is released.
- Before listing or reclaiming an expired real session hold, retrieve/expire it in Stripe. If paid, apply payment first and reject the new claim. This closes the delayed-webhook gap. Stripe uncertainty prevents checkout creation/release.
- Stripe gets one card-only JPY line, no shipping, a 31-minute expiry (one minute above Stripe’s minimum to allow for request latency), server-authoritative deposit, configured public origin (same resolution as store), deposit disclosure, and `source: kihoko-flash` metadata.
- After Stripe creation: create pending claim, then guarded replacement of the provisional token with the session id. Only then return the checkout URL.
- Checkout/claim-write failure releases **only this request’s provisional token**. If a session exists, expire it first; if cleanup is uncertain or paid, retain/reconcile the hold. A failed attachment retains a real session hold for webhook/lazy recovery.
- Paid completion takes the design **before** marking claim paid. An interrupted write is completed by webhook retry. Late paid completion overrides expired/cancelled claim status. A different existing taken owner is preserved, the paid claim receives `conflict: true`, and a CRITICAL log is emitted.
- Cancellation checks/expires Stripe first, re-reading when completion races expiry. Paid sessions are reconciled and never released. Otherwise mark pending claim cancelled, then release only its matching hold. Repeated cancelled requests can finish an interrupted release.
- Expiry marks only pending claims expired, then releases only a matching hold. Never downgrade paid claims or release taken designs. Expiry redelivery can finish an interrupted release.
- Every flash/claim write uses `_etag`. No cross-partition transaction is assumed. Failures return retryable errors; a failed write does not silently drop a payment.

Stripe Dashboard webhook events: `checkout.session.completed`, `checkout.session.expired`, plus the existing shop async succeeded/failed events. Signature verification is unchanged. Configure the existing `PUBLIC_SITE_URL` for production redirect origin. Store events and stock handling remain unchanged.

Public routes use the existing API response envelope `{ success: true, data: ... }`:

- `GET /api/flash`: sorted public designs only (hidden excluded). Exactly `id,title,description,imageUrl,thumbnailUrl,width,height,depositJpy,sizeNote,priceNote,status`, plus optional nonblank `place`; effective status available/held/taken.
- `POST /api/flash/{id}/claim`: eight booking fields plus `agree: true`; returns `{ url, sessionId }`. HTTP 409: `Someone just claimed this design`.
- `POST /api/flash/claim/cancel`: `{ sessionId: "cs_..." }`, idempotent; no booking data.
- `GET /api/flash/claim?session_id=cs_...`: exactly `{ status, flashTitle, thumbnailUrl, depositJpy }`. Unknown sessions return `status: "unknown"` with the other fields null. Possession of a session id never exposes booking details.

## Offline local preview

No credentials, network, installs, or real charges are needed. Dependencies in api/web are already installed. Run in two terminals from the repository root:

```sh
export PATH=/Users/mjjones/.nvm/versions/node/v24.19.0/bin:$PATH
node scripts/flash-dev-mock.js
```

```sh
export PATH=/Users/mjjones/.nvm/versions/node/v24.19.0/bin:$PATH
cd web
REACT_APP_API_URL=http://localhost:7071/api npm start
```

Open `http://localhost:3000/flash`. The mock runs only on loopback, serves 18 in-memory designs (two taken, one held), and generates SVG artwork locally with mixed portrait/landscape dimensions. Exactly three fixtures have a full-size opaque white background behind the drawing: `flash-1` (available portrait), `flash-11` (available landscape), and `flash-2` (taken landscape). The other 15 remain transparent. Six of the 18 fixtures have NYC/Kyoto/Lisbon place tags; the rest are blank. Pick a design, complete the form, and choose Pay or Cancel on “Pretend Stripe”. Pay applies the real flash state machine to the fixture then redirects to `/flash/claimed`; Cancel returns to `/flash?cancelled=cs_...` where the real page calls the cancellation API. Restart the mock to reset fixtures. Alternate port: `FLASH_MOCK_PORT=7072 node scripts/flash-dev-mock.js`, with the matching `REACT_APP_API_URL`. Production web code never imports or references the mock.

Desktop at least 1400px wide and 820px tall: four designs per paper page. Smaller desktop/tablet windows: one design per page, two pages per spread. Page edges/arrows/keyboard and a single-row range scrubber navigate the book. Paper height is bounded by viewport height; phone sizing also measures the site header. Phone below 768px: one design per page and horizontal swipe drag. Reduced motion cross-fades. Only current/next spread art loads; sheet uses the full original image. Escape/close/backdrop closes the portal dialog, background becomes inert, focus is trapped and restored, and body scrolling is locked. Empty collection is a closed cover. Tapping the detail image opens a full-screen paper card on a dark backdrop; tap or Escape closes it and returns focus. All artwork surfaces (book pages, detail image, confirmation thumbnail, and full-screen card) use light cream `#f5f1e8` in light mode and softer cream `#e9e4d8` in dark mode, with dark ink `#36372e` for text on paper. The empty/loading cover, book frame, controls, and sheet chrome follow the surrounding theme. Artwork images use `mix-blend-mode: multiply` so white or near-white scans sit in the paper. Each shared artwork frame paints the paper colour with `isolation: isolate`, keeping the image and paper in the same stacking context even during book hover/page transforms. No inversion or tint filters are used; sold/held artwork retains its existing dimmed state, while stickers/tags remain opaque and unblended. The success page polls six times and offers a manual retry if confirmation is delayed. Place tags appear uppercase next to book/detail titles; a page whose designs all share one nonblank place uses that place in the corner, otherwise `Osaka, JP`. Design dimensions/pricing appear together with “Can be made bigger for an added cost — tell Kiho the size you'd like.” The editable “Size you'd like” booking field starts with `sizeNote`; there is no automatic tattoo-price calculation. Header navigation collapses below 1200px and uses tighter spacing from 1200–1399px. Existing SWA history fallback already handles both new routes.

## Verification commands

```sh
cd api && node --test test/*.test.js
cd ../web && npm run build
```

The flash tests use mock db and fake Stripe, including concurrency, expired holds, delayed payment, cancellations, payload/privacy validation, and interrupted webhook recovery. Existing store tests stay unchanged. Live Stripe, real Cosmos etags/indexes, live Azure routing, and real-phone visual/touch quality require later review; local fixtures and unit tests cannot prove those integrations.

The pure `flashDocument(data, nowMilliseconds)` builder in `api/shared/flash.js` provides the canonical uploader shape/defaults and validates core image/deposit fields. Supply the uploader-generated UUID and clock; it intentionally omits Cosmos system fields. Existing-document updates still must preserve API-owned state and use Cosmos `IfMatch`; the builder is not permission to reset a claimed design.

In this managed workspace, loopback server binding returned `EPERM`; preview HTTP flows were instead exercised by calling the mock's registered Node HTTP handler in-process (including Pay/Cancel redirects and simultaneous claims). Starting the two local servers and checking the UI in a browser remains a reviewer step outside that restriction.

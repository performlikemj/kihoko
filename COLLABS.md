# Collaborations — Studio contract and public gallery

Collaborations live in the existing Cosmos database `KihokoPortfolio`, container `Portfolio`, partitioned by `/type`. The partition key is the literal **`collab`**. Kiho Studio writes these documents directly; the site only reads. Images use the existing public **`media`** blob container. No upload endpoint or database migration is needed.

## Uploader contract: `collab` document

Write one complete document per collaboration (replace example UUIDs and blob paths with real values):

```json
{
  "id": "508a5a1a-3eaa-4c1a-a4ea-75a4553d1d53",
  "type": "collab",
  "title": "Collab with Studio X",
  "note": "",
  "link": "",
  "status": "visible",
  "order": 0,
  "images": [
    {
      "id": "57d5cdc1-ab7c-4a8d-a213-f248f99f0059",
      "blobName": "images/collabs/57d5cdc1-ab7c-4a8d-a213-f248f99f0059.jpg",
      "thumbnailBlobName": "thumbnails/collabs/57d5cdc1-ab7c-4a8d-a213-f248f99f0059.jpg",
      "width": 1600,
      "height": 1200
    }
  ],
  "createdAt": "2026-10-18T00:00:00.000Z",
  "updatedAt": "2026-10-18T00:00:00.000Z"
}
```

| Field | Type / exact meaning |
| --- | --- |
| `id` | Stable UUID string. Partition key: `collab`. |
| `type` | Literal `"collab"`. |
| `title` | Nonempty string, at most 120 characters. Whitespace-only titles are invalid. |
| `note` | String, at most 300 characters; `""` if none. Rendered as plain text. |
| `link` | `""` or an absolute `http://` / `https://` URL, at most 500 characters. |
| `status` | Exactly `"visible"` or `"hidden"`. Hidden documents never appear publicly. |
| `order` | Finite number; ascending display order. Ties use newer `createdAt` first. |
| `images` | Array in the intended display order. An empty array is allowed while preparing a collaboration. |
| `images[].id` | Stable UUID string for the image. |
| `images[].blobName` | Original blob path inside public `media`, not a full URL. Use `images/collabs/<uuid>.<extension>`. |
| `images[].thumbnailBlobName` | Thumbnail blob path inside `media`. Use `thumbnails/collabs/<uuid>.<extension>` or `""` for no thumbnail. Missing/null legacy values also fall back to the original. |
| `images[].width`, `images[].height` | Positive integer original dimensions, in pixels. |
| `createdAt`, `updatedAt` | ISO-8601 timestamps. Preserve creation time and update modification time on edits. |

Cosmos supplies `_etag` and other system fields. Do not generate those fields. Upload blobs before making the document visible. Studio owns document edits, ordering, and visibility; the site performs no collaboration writes.

## Public API and page

`GET /api/collabs` is anonymous and returns the existing response envelope with `Cache-Control: public, max-age=60`:

```json
{
  "success": true,
  "data": [
    {
      "id": "508a5a1a-3eaa-4c1a-a4ea-75a4553d1d53",
      "title": "Collab with Studio X",
      "note": "",
      "link": "",
      "images": [
        {
          "url": "https://<account>.blob.core.windows.net/media/images/collabs/<uuid>.jpg",
          "thumbnailUrl": "https://<account>.blob.core.windows.net/media/thumbnails/collabs/<uuid>.jpg",
          "width": 1600,
          "height": 1200
        }
      ],
      "order": 0,
      "createdAt": "2026-10-18T00:00:00.000Z"
    }
  ]
}
```

The database helper queries only the `collab` partition. Sorting happens in the public projection, so no new Cosmos composite index is required. Hidden, unknown-status, or malformed documents (including malformed image entries) are skipped individually. An invalid, overlong, or non-http(s) link becomes `""` while its otherwise-valid collaboration remains visible. Original and thumbnail URLs use the existing blob service; missing thumbnail paths or unavailable thumbnail URLs fall back to the original. A database failure returns HTTP 500 and an error envelope, allowing the page to offer a retry instead of showing a misleading empty gallery.

`/collaborations` shows one section per collaboration: title, optional note, optional external link, then lazy-loaded photos. Links display the host/path, open a new tab, and use `rel="noopener noreferrer"`; the page also checks http(s) before rendering links. All photos use `object-fit: contain`, preserving portrait and landscape art. Light/dark colours follow the site theme. The shared `.flex-container` paints `theme.background` opaquely, so page content cannot show the intermediate grey from the body’s 300 ms background transition. This fixes the common startup path on Collaborations, Tattoo, Flash, and Ceramics: `App` initially renders light, then restores a saved dark preference in an effect; their previously transparent page/layout wrappers exposed the transitioning body. No loading overlay caused the grey. Notes retain the existing `theme.textMuted`: `#6c757d` on white (4.69:1) and `#999999` on `#121212` (6.58:1), both above WCAG AA 4.5:1. Loading, retryable error, and “Collaborations coming soon” empty states are included.

Tap/click a photo to open a full-screen dialog. Arrow buttons, Left/Right keys, and horizontal swipe navigate only that collaboration's photos, wrapping at either end. Escape or Close returns to the triggering photo. Background content becomes inert, focus stays inside the dialog, and body scrolling is locked until it closes.

Navigation order is About, Tattoo, Flash, Ceramics, Collaborations, Shop, Contact. The same order appears over the home photo; its links wrap within the photo on narrow screens. Header navigation still collapses below 1200px, with tighter spacing at 1200–1599px for the added link.

## Offline local preview

This extends the credential-free mock in [FLASH.md](FLASH.md#offline-local-preview). From the repo root, run in two terminals:

```sh
export PATH=/Users/mjjones/.nvm/versions/node/v24.19.0/bin:$PATH
node scripts/flash-dev-mock.js
```

```sh
export PATH=/Users/mjjones/.nvm/versions/node/v24.19.0/bin:$PATH
cd web
REACT_APP_API_URL=http://localhost:7071/api npm start -- --no-open
```

Open `http://localhost:3000/collaborations`. Existing api/web dependencies must be installed. No Azure credentials or service calls are needed. The mock binds only to loopback and generates artwork locally. The site's existing Bootstrap, Font Awesome, fonts, and AOS CDN assets still need network access or a warm browser cache for a fully styled preview and working collapsed menu.

The mock serves three in-memory collaboration fixtures through the same public projection as the real API:

- **Collab with Studio X**: a note, `https://instagram.com/studiox`, and five photos (three portrait, two landscape). The fifth photo has no thumbnail path to exercise fallback.
- **Quiet objects**: title only, with two photos (one portrait, one landscape).
- **Hidden collaboration**: hidden with a lower order; must never appear in the public API or page.

The original 18 Flash fixtures and Pretend Stripe flow remain available. Restart the mock to reset. For another port use `FLASH_MOCK_PORT=7072 node scripts/flash-dev-mock.js` and the matching web `REACT_APP_API_URL`.

## Verification commands

```sh
cd api && node --test test/*.test.js
cd ../web && npm run build
```

With the two preview processes running, use an existing Playwright installation (the check requires no project dependency changes):

```sh
PLAYWRIGHT_MODULE_PATH=/absolute/path/to/node_modules/playwright \
  node scripts/collabs-preview-check.js
```

The headless check composites note text, ancestor background colours, and ancestor opacity to require WCAG AA contrast of at least 4.5:1 in both themes. It asserts the actual theme background immediately after the theme becomes active, without waiting out the body transition, and compares dark surfaces with `/tattoo`, `/flash`, and `/ceramics`. It also covers 390×844 and 1440×900, light/dark, menu order (opening the phone menu), both visible sections, seven photos, hidden exclusion, full-screen next/previous/keyboard/swipe/close, focus restoration, page errors, and `scrollWidth === innerWidth`. It also checks widths 320–1920px, the 993–1399px header breakpoints, the home links inside the photo at 320px, and loading/error/retry/empty states. Screenshots go under ignored `.preview-shots/` as `collabs-<width>-<theme>.png`, `viewer-<width>-<theme>.png`, `menu-390-<theme>.png`, and `home-320.png`. Override the preview origin with `COLLABS_PREVIEW_URL` if needed.

In this managed workspace, loopback binding fails with `listen EPERM` and Chromium launch fails with `MachPortRendezvousServer … Permission denied (1100)`. API tests and the production build run here, but the browser gate and screenshots require running the supplied check in an environment that permits local servers and Chromium. No browser gate or screenshot is claimed from this restricted run. Real Cosmos/blob integration also remains unverified without credentials.

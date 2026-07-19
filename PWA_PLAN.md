# PWA Conversion Plan

Goal: turn the tkinter desktop app into an installable, offline-capable Progressive Web App.

## Recommended architecture: fully client-side, no backend

Everything in `tube_network.py` is static in-memory data plus pure BFS logic — no
file I/O, no external services. That means the whole app can run in the browser
with no server component beyond static hosting (GitHub Pages, Netlify, etc.).
This is the simplest possible PWA shape: no API, no CORS, no auth, offline works
automatically once assets are cached.

Alternative (keep Python, add a Flask/FastAPI JSON API + JS frontend) was
considered and rejected for now — it adds a server to operate/host and makes
offline support harder for no real benefit, since there's no live data source
yet (that's Phase 3 in the README roadmap, still TODO).

## File plan

New files, old files stay for the reference/README's history but the app entry
point moves to the browser:

- `index.html` — page shell, station selects, swap/plan/clear buttons, options
  checkboxes, results panel. Structural port of `create_widgets()` in `main.py`.
- `styles.css` — TfL blue theme, line colour swatches, responsive layout
  (left panel / right panel on desktop, stacked on mobile).
- `tube-network.js` — direct port of `tube_network.py`: `graph` object,
  `lineColors`, `_buildNetwork`, `findRoute` (BFS), `getRouteLegs`,
  `getRouteDetails`, `getStationLines`. This is a mechanical translation —
  same data, same algorithm, no logic changes.
- `app.js` — port of the `LondonUndergroundApp` interaction logic: populate
  dropdowns, swap button, plan/clear handlers, render legs with line-colour
  spans (reuse the existing luminance-based contrast function), step-by-step
  directions with interchange detection.
- `manifest.json` — name, short_name, theme_color `#003366`, background_color,
  icons (need to generate a few PNG sizes — 192x192, 512x512, maskable
  variant), `display: standalone`, `start_url`.
- `service-worker.js` — cache-first strategy for the app shell (HTML/CSS/JS/
  icons) since there's no dynamic data; register it in `app.js`.
- `icons/` — app icons generated from a simple tube-roundel-style mark.

## Feature parity checklist (from current tkinter UI)

- [ ] From/To station selects with type-to-filter (use `<datalist>` or a small
      custom autocomplete — native `<select>` doesn't filter by typing)
- [ ] ⇄ swap button
- [ ] Plan Route / Clear buttons
- [ ] Options: show interchanges, step-by-step directions, colourise legs
      (checkboxes wired to re-render on change)
- [ ] Route summary (total stops, estimated time)
- [ ] Colour-coded leg list using `lineColors` + contrast function
- [ ] Step-by-step directions with 🚀 start / 🎯 end / 🔄 interchange markers
- [ ] Welcome message on load, error states (same station, station not found,
      no route found) as inline messages instead of `messagebox` popups

## Steps

1. Port `tube_network.py` → `tube-network.js` (data + BFS + leg-building),
   verify with a few known routes side-by-side against the Python output.
2. Build static `index.html` + `styles.css` matching current layout/branding.
3. Wire up `app.js` for all interactions and rendering, replacing tkinter
   widgets with DOM equivalents.
4. Add `manifest.json` + icons; verify installability (Chrome "Install app"
   prompt / Lighthouse PWA audit).
5. Add `service-worker.js` for offline caching; test airplane-mode reload.
6. Update `README.md` with new run instructions (open `index.html` / serve
   via any static file server; old Python instructions moved to a
   "legacy desktop version" section or removed).
7. Optional polish: responsive layout for mobile, keyboard navigation,
   basic accessibility (labels, focus states).

## Effort estimate

- Steps 1–3 (core rewrite): ~half a day to a day, mostly UI/CSS polish time.
- Steps 4–5 (PWA plumbing): ~1–2 hours, mostly icon generation and testing.
- Total: roughly one working day for full feature parity.

## Open questions for you

- Keep the Python/tkinter version in the repo as a "legacy" option, or
  replace it entirely?
- Any preference on vanilla JS vs. a tiny framework? Given the app's size
  (one screen, no routing), vanilla JS keeps this a true zero-build PWA —
  recommended unless you want this as a base for a much bigger app later.
- Any branding assets (logo/icon) to use, or generate a placeholder tube
  roundel?

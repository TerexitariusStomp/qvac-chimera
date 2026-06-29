# QVAC Frontend

React frontend for the QVAC backend node. Provides the LLM Wiki UI, AI Writer panel, and mining status dashboard.

## Development

```bash
cd qvac/frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` by default and proxies API calls to the QVAC backend.

## Build

```bash
npm run build
```

The build output is copied to `apps/desktop/src-tauri/dist` for the Tauri desktop app and to `apps/mobile*` for Capacitor/Expo mobile builds.

## Structure

- `src/components/` — React components (editor, sidebar, AI writer, etc.)
- `src/api/` — API client for the QVAC backend
- `src/hooks/` — React hooks
- `public/` — Static assets

## Related

- `../src/web/server.js` — QVAC backend HTTP server
- `../../apps/desktop/` — Tauri desktop wrapper
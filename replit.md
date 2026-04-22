# InboxFlow

Prototype web app that helps users organize emails into folders, filter by keywords, and assign priority levels. Final project for BAIS:3400 Digital Product Management.

## Stack
- React 18 + Vite 5 (frontend only)
- Data persisted to browser `localStorage` (no backend)

## Project Layout
- `index.html` — Vite entry HTML
- `src/main.jsx` — React bootstrap
- `src/App.jsx` — Main UI (folders, filters, email list)
- `src/styles.css` — Styles
- `vite.config.js` — Vite config (host 0.0.0.0, port 5000, allowedHosts: true)

## Running
- Dev: workflow "Frontend" runs `npm run dev` on port 5000
- Build: `npm run build` → outputs to `dist/`
- Deployment: configured as `static`, builds with `npm run build`, serves `dist/`

## Notes
- Repo was imported with only a README; the prototype was built from scratch based on the README description.

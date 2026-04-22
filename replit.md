# InboxFlow

Clickable React prototype based on Lauren Brodsky's BAIS:3400 product spec. Helps busy professionals find important emails using folders, keyword filters, and priority levels.

## Stack
- React 18 + Vite 5
- React Router 6 (Landing + Settings)
- Data persisted to browser `localStorage` (no backend)

## Pages
- `/` — Landing page (hero, features, how-it-works, why, product-goal metrics, testimonials, CTA, footer)
- `/settings` — InboxFlow Settings dashboard (Folders, Filters & Rules, Priority Tags, Save/Reset) with right-side modals for Create/Edit Folder and Create/Edit Filter

## Project Layout
- `index.html` · `src/main.jsx` · `src/App.jsx` (router shell)
- `src/pages/Landing.jsx`, `src/pages/Settings.jsx`
- `src/components/Modal.jsx`, `FolderModal.jsx`, `FilterModal.jsx`, `Toast.jsx`
- `src/hooks/useLocalStorage.js`
- `src/data/defaults.js` (colors, priorities, sample folders/filters)
- `src/styles.css` (design tokens + all component styles)
- `vite.config.js` (host 0.0.0.0, port 5000, allowedHosts: true)

## Running
- Dev: workflow "Frontend" runs `npm run dev` on port 5000
- Build: `npm run build` → outputs `dist/`
- Deployment: configured static, builds with `npm run build`, serves `dist/`

## Notes
- Front-end-only per the prototype spec. The companion spec for full Gmail OAuth/sync backend was not implemented because it requires Google OAuth credentials and a database — can be added on request.
- Reference image preserved at `public/assets/prototype-reference.png`.

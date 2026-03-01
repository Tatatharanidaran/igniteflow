# MomentumOS

MomentumOS is a lightweight personal productivity web app built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- LocalStorage persistence
- Static export compatible (`output: 'export'`)

## Run locally
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build for production
```bash
npm run build
```

Static files are generated for Vercel-compatible deployment.

## Keyboard shortcuts
- `Ctrl + Shift + 1` toggle Trading timer
- `Ctrl + Shift + 2` toggle Building timer
- `Ctrl + Shift + 3` toggle SEO timer

## Data
All app data is client-side in `localStorage` (`momentumos.v1`), with JSON import/export/reset in Settings.

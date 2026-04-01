# IgniteFlow

IgniteFlow is a lightweight personal productivity web app built with Next.js 14, TypeScript, and Tailwind CSS.

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
All app data is client-side in browser `localStorage` under `igniteflow.v1`.

This means each browser and each machine has its own separate data. Linux and Windows will not sync automatically unless you:

1. Export or download a backup from one machine.
2. Open IgniteFlow on the other machine.
3. Import the backup JSON in Settings.

# CRT Intelligence Dashboard

React + Vite trading dashboard with Smart Money Concepts, CRT/Vega strategy tools, broker integrations and market-data views.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local Vite URL printed in the terminal.

## Production build and run

```bash
npm install
npm run build
npm start
```

The Express production server serves the built frontend from `dist` and exposes the market-data routes:
- `GET /api/health`
- `GET /api/live-stream`
- `GET /api/historical-candles?symbol=%5ENSEI&range=3mo&interval=1d`
- `GET /api/yahoo-chart/*`

## Deploy to Render

This repository includes `render.yaml`. In Render, choose **New → Blueprint** and select this repository. Render will create a Node web service (not a Static Site).

If configuring manually:
- Runtime: Node
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`

## Gemini AI configuration

Do not place a Gemini API key in source code or a `VITE_*` variable: Vite bundles client-side variables into public browser assets. The current AI integration reads its key in the browser, so use only a restricted, disposable key with appropriate quotas and rotate any key that has previously been committed or exposed. A secure production setup requires moving Gemini requests behind authenticated server endpoints; this deployment does not claim to have completed that backend migration.

## Notes

Market-data providers can rate-limit or change their public endpoints. Live data availability is subject to TradingView/Yahoo Finance service availability and their terms. This dashboard is informational and is not financial advice.

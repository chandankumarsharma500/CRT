# CRT Intelligence — Streamlit / Python edition

This repository contains the original React + Vite application and a Python-native Streamlit edition.

## Deploy on Streamlit Community Cloud

1. Open https://share.streamlit.io/ and sign in with GitHub.
2. Select **Create app**.
3. Choose repository `chandankumarsharma500/CRT`, branch `streamlit-python-port`, and main file path `app.py`.
4. Click **Deploy**.

Streamlit Community Cloud installs dependencies from `requirements.txt` automatically.

## Run locally

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

## Optional Gemini AI

In Streamlit Community Cloud open **App → Settings → Secrets** and add:

```toml
GEMINI_API_KEY = "your-key"
```

Never commit API keys to GitHub.

## Current port status

The Python app includes a market dashboard, EMA/RSI/ATR indicators, a basic CRT range/liquidity scanner, a transparent breakout backtest, a best-effort Yahoo Finance option-chain view, and optional Gemini analysis.

The original React code remains in the repository as reference. Its full Vega/SMC engine, all filters, broker OAuth/order flows, live broker WebSockets, PDF views and advanced AI-agent workflows have **not** been fully ported yet. Broker and exchange integrations require separate Python implementations and credentials. Market data depends on third-party availability and may be delayed.

This is an analytical tool, not financial advice, and it does not place trades.

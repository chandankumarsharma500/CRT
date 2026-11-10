from __future__ import annotations

from datetime import date, timedelta
import os
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
import yfinance as yf

st.set_page_config(page_title="CRT Intelligence", page_icon="📈", layout="wide", initial_sidebar_state="expanded")

# ---------- Theme ----------
st.markdown("""
<style>
:root { color-scheme: dark; }
[data-testid="stAppViewContainer"] { background: #07111f; }
[data-testid="stSidebar"] { background: #0b1728; border-right: 1px solid #1e3148; }
.block-container { padding-top: 1.3rem; max-width: 1600px; }
h1,h2,h3 { letter-spacing: -.03em; }
.metric-card { background: linear-gradient(135deg,#10233a,#0c1a2b); border:1px solid #213953; border-radius:14px; padding:14px 18px; }
.small-muted { color:#91a4ba; font-size: .86rem; }
.stButton>button { border-radius:9px; }
</style>
""", unsafe_allow_html=True)

INDICES = {
    "NIFTY 50": "^NSEI",
    "BANK NIFTY": "^NSEBANK",
    "SENSEX": "^BSESN",
    "FINNIFTY": "NIFTY_FIN_SERVICE.NS",
    "NIFTY MIDCAP 50": "NIFTY_MIDCAP_50.NS",
}
SYMBOLS = {"NIFTY 50": "^NSEI", "BANK NIFTY": "^NSEBANK", "SENSEX": "^BSESN",
           "RELIANCE": "RELIANCE.NS", "HDFCBANK": "HDFCBANK.NS", "ICICIBANK": "ICICIBANK.NS",
           "INFY": "INFY.NS", "TCS": "TCS.NS", "SBIN": "SBIN.NS", "ITC": "ITC.NS"}

@st.cache_data(ttl=90, show_spinner=False)
def load_history(symbol: str, period: str = "6mo", interval: str = "1d") -> pd.DataFrame:
    frame = yf.download(symbol, period=period, interval=interval, auto_adjust=True, progress=False, threads=False)
    if frame is None or frame.empty:
        return pd.DataFrame()
    if isinstance(frame.columns, pd.MultiIndex):
        frame.columns = frame.columns.get_level_values(0)
    frame.columns = [str(c).title() for c in frame.columns]
    required = ["Open", "High", "Low", "Close"]
    if not all(c in frame.columns for c in required):
        return pd.DataFrame()
    if "Volume" not in frame.columns:
        frame["Volume"] = 0
    return frame.dropna(subset=required)

def indicators(df: pd.DataFrame) -> pd.DataFrame:
    x = df.copy()
    x["EMA20"] = x["Close"].ewm(span=20, adjust=False).mean()
    x["EMA50"] = x["Close"].ewm(span=50, adjust=False).mean()
    delta = x["Close"].diff()
    gain, loss = delta.clip(lower=0), -delta.clip(upper=0)
    rs = gain.rolling(14).mean() / loss.rolling(14).mean().replace(0, np.nan)
    x["RSI"] = 100 - (100 / (1 + rs))
    x["ATR"] = (x["High"] - x["Low"]).rolling(14).mean()
    return x

def crt_scan(df: pd.DataFrame) -> dict:
    if len(df) < 5:
        return {"signal": "Insufficient data", "detail": "At least five candles are needed.", "levels": {}}
    x = df.copy()
    prev = x.iloc[-2]
    cur = x.iloc[-1]
    recent = x.iloc[-6:-1]
    prior_high, prior_low = float(recent["High"].max()), float(recent["Low"].min())
    sweep_high = float(cur["High"]) > prior_high and float(cur["Close"]) < prior_high
    sweep_low = float(cur["Low"]) < prior_low and float(cur["Close"]) > prior_low
    bull_break = float(cur["Close"]) > prior_high
    bear_break = float(cur["Close"]) < prior_low
    if sweep_low:
        signal, detail = "Bullish liquidity sweep", "Price traded below recent lows and closed back above the range."
    elif sweep_high:
        signal, detail = "Bearish liquidity sweep", "Price traded above recent highs and closed back below the range."
    elif bull_break:
        signal, detail = "Bullish range breakout", "Close is above the recent five-candle high."
    elif bear_break:
        signal, detail = "Bearish range breakdown", "Close is below the recent five-candle low."
    else:
        signal, detail = "Range / no confirmed setup", "No sweep or close-confirmed break of the recent range."
    return {"signal": signal, "detail": detail, "levels": {"Range high": prior_high, "Range low": prior_low,
            "Latest close": float(cur["Close"]), "Previous close": float(prev["Close"])}}

def candle_chart(df: pd.DataFrame, title: str):
    x = indicators(df)
    fig = go.Figure()
    fig.add_trace(go.Candlestick(x=x.index, open=x["Open"], high=x["High"], low=x["Low"], close=x["Close"], name="Price"))
    fig.add_trace(go.Scatter(x=x.index, y=x["EMA20"], name="EMA 20", line=dict(width=1.4)))
    fig.add_trace(go.Scatter(x=x.index, y=x["EMA50"], name="EMA 50", line=dict(width=1.4)))
    fig.update_layout(title=title, template="plotly_dark", height=480, margin=dict(l=10,r=10,t=45,b=10),
                      xaxis_rangeslider_visible=False, paper_bgcolor="#07111f", plot_bgcolor="#07111f",
                      legend=dict(orientation="h", y=1.02, x=0))
    return fig, x

def fmt(value):
    return f"₹{value:,.2f}" if pd.notna(value) else "—"

# ---------- Sidebar ----------
st.sidebar.markdown("## 📈 CRT INTELLIGENCE")
st.sidebar.caption("Smart Money • Range Theory • Market Monitor")
page = st.sidebar.radio("WORKSPACE", ["Dashboard", "CRT Scanner", "Backtesting", "Option Chain", "AI Analyst", "About"])
st.sidebar.divider()
instrument_name = st.sidebar.selectbox("Instrument", list(SYMBOLS.keys()), index=0)
symbol = SYMBOLS[instrument_name]
period = st.sidebar.selectbox("History", ["1mo", "3mo", "6mo", "1y", "2y", "5y"], index=2)
interval = st.sidebar.selectbox("Candle interval", ["1d", "1h", "30m", "15m", "5m"], index=0)
st.sidebar.caption("Data: Yahoo Finance public feed. Delayed/incomplete data is possible.")
if st.sidebar.button("↻ Refresh market data", use_container_width=True):
    load_history.clear()
    st.rerun()

st.title("CRT Intelligence Core")
st.caption("Market structure • liquidity sweeps • CRT range analysis")
with st.spinner("Fetching market data…"):
    data = load_history(symbol, period, interval)

if page == "Dashboard":
    st.subheader("Market overview")
    cols = st.columns(4)
    for col, (name, ticker) in zip(cols, list(INDICES.items())[:4]):
        d = load_history(ticker, "5d", "1d")
        if d.empty:
            col.metric(name, "Unavailable")
        else:
            last = float(d["Close"].iloc[-1])
            change = (last / float(d["Close"].iloc[-2]) - 1) * 100 if len(d) > 1 else 0
            col.metric(name, fmt(last), f"{change:+.2f}%")
    st.divider()
    left, right = st.columns([2.2, 1])
    with left:
        if not data.empty:
            fig, enriched = candle_chart(data, f"{instrument_name} · {period} · {interval}")
            st.plotly_chart(fig, use_container_width=True)
            st.caption(f"Last candle: {enriched.index[-1]}")
        else:
            st.error("Market data is unavailable for this instrument right now. Try another symbol or refresh.")
    with right:
        if not data.empty:
            enriched = indicators(data)
            last = enriched.iloc[-1]
            st.markdown("### Technical snapshot")
            st.metric("Last price", fmt(last["Close"]))
            st.metric("RSI (14)", f"{last['RSI']:.1f}" if pd.notna(last["RSI"]) else "—")
            st.metric("EMA 20", fmt(last["EMA20"]))
            st.metric("EMA 50", fmt(last["EMA50"]))
            trend = "Bullish bias" if last["EMA20"] > last["EMA50"] else "Bearish bias"
            st.info(trend)
    if not data.empty:
        st.markdown("### Recent candles")
        st.dataframe(data.tail(10).sort_index(ascending=False), use_container_width=True)

elif page == "CRT Scanner":
    st.subheader("CRT / liquidity scanner")
    if data.empty:
        st.error("No candle data returned. Change the instrument or interval.")
    else:
        fig, enriched = candle_chart(data, f"{instrument_name} · CRT view")
        st.plotly_chart(fig, use_container_width=True)
        result = crt_scan(data)
        st.markdown("### Latest setup")
        if "Bullish" in result["signal"]:
            st.success(result["signal"])
        elif "Bearish" in result["signal"]:
            st.warning(result["signal"])
        else:
            st.info(result["signal"])
        st.write(result["detail"])
        metric_cols = st.columns(len(result["levels"]))
        for col, (label, value) in zip(metric_cols, result["levels"].items()):
            col.metric(label, fmt(value))
        st.caption("Rule-based educational scan using the previous five completed candles. Confirm independently; this is not a trade recommendation.")
        st.markdown("### Indicator values")
        st.dataframe(enriched[["Open","High","Low","Close","Volume","EMA20","EMA50","RSI","ATR"]].tail(20).sort_index(ascending=False), use_container_width=True)

elif page == "Backtesting":
    st.subheader("Simple CRT breakout backtest")
    st.warning("This is a transparent research baseline, not the original proprietary Vega/SMC engine. It excludes brokerage, slippage and taxes.")
    if data.empty or len(data) < 30:
        st.error("At least 30 candles are required.")
    else:
        lookback = st.slider("Range lookback candles", 3, 20, 5)
        x = data.copy()
        x["PriorHigh"] = x["High"].shift(1).rolling(lookback).max()
        x["PriorLow"] = x["Low"].shift(1).rolling(lookback).min()
        x["Signal"] = np.where(x["Close"] > x["PriorHigh"], 1, np.where(x["Close"] < x["PriorLow"], -1, 0))
        x["Position"] = x["Signal"].shift(1).fillna(0)
        x["MarketReturn"] = x["Close"].pct_change().fillna(0)
        x["StrategyReturn"] = x["Position"] * x["MarketReturn"]
        x["Equity"] = (1 + x["StrategyReturn"]).cumprod() * 100000
        total = (x["Equity"].iloc[-1] / 100000 - 1) * 100
        peak = x["Equity"].cummax()
        drawdown = ((x["Equity"] / peak) - 1).min() * 100
        trades = int((x["Position"].diff().fillna(x["Position"]) != 0).sum())
        a,b,c = st.columns(3)
        a.metric("Strategy return", f"{total:+.2f}%")
        b.metric("Max drawdown", f"{drawdown:.2f}%")
        c.metric("Position changes", str(trades))
        fig = go.Figure(go.Scatter(x=x.index, y=x["Equity"], name="Equity"))
        fig.update_layout(template="plotly_dark", height=380, title="Hypothetical equity curve", paper_bgcolor="#07111f", plot_bgcolor="#07111f")
        st.plotly_chart(fig, use_container_width=True)
        st.dataframe(x[["Close","PriorHigh","PriorLow","Signal","Position","StrategyReturn","Equity"]].tail(30).sort_index(ascending=False), use_container_width=True)

elif page == "Option Chain":
    st.subheader("Option chain")
    st.info("Yahoo Finance option-chain coverage for Indian indices is inconsistent. Select a supported underlying and expiry where the provider exposes data.")
    option_symbol = st.text_input("Yahoo Finance ticker", value="^NSEI", help="Examples: RELIANCE.NS, TCS.NS. Index options may not be available.")
    try:
        ticker = yf.Ticker(option_symbol.strip())
        expiries = ticker.options
        if not expiries:
            st.warning("No option expiries are exposed by the current data provider for this ticker.")
        else:
            expiry = st.selectbox("Expiry", expiries)
            chain = ticker.option_chain(expiry)
            calls, puts = st.columns(2)
            with calls:
                st.markdown("#### Calls")
                st.dataframe(chain.calls, use_container_width=True, height=420)
            with puts:
                st.markdown("#### Puts")
                st.dataframe(chain.puts, use_container_width=True, height=420)
    except Exception as exc:
        st.error(f"Option-chain request failed: {exc}")

elif page == "AI Analyst":
    st.subheader("AI market analyst")
    st.caption("Optional Gemini integration. Add GEMINI_API_KEY in Streamlit App → Settings → Secrets.")
    question = st.text_area("Ask about the selected market", placeholder="Explain the latest range, liquidity sweep and risk factors…")
    if st.button("Analyse", type="primary") and question.strip():
        key = st.secrets.get("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
        if not key:
            st.warning("Gemini key not configured. Add GEMINI_API_KEY to Streamlit Secrets.")
        else:
            try:
                from google import genai
                client = genai.Client(api_key=key)
                snapshot = crt_scan(data) if not data.empty else {"signal":"No data","detail":"Market data unavailable"}
                context = f"Instrument: {instrument_name} ({symbol}). CRT scan: {snapshot}. User question: {question}. Give educational analysis, clearly state uncertainty, do not give personalized financial advice."
                with st.spinner("Generating analysis…"):
                    response = client.models.generate_content(model="gemini-2.0-flash", contents=context)
                st.markdown(response.text or "No response returned.")
            except Exception as exc:
                st.error(f"AI request failed: {exc}")

elif page == "About":
    st.subheader("About this Python edition")
    st.markdown("""
    This Streamlit edition establishes a Python-native deployment for Streamlit Community Cloud.

    **Included now**
    - Market dashboard with index snapshots and candlestick charts
    - EMA 20/50, RSI and ATR indicators
    - Rule-based CRT range breakout and liquidity-sweep scanner
    - Basic transparent breakout backtest
    - Best-effort Yahoo Finance option-chain viewer
    - Optional Gemini analyst via Streamlit Secrets

    **Not yet ported from the React application**
    - Original Vega/SMC proprietary strategy engine and all its filters
    - Broker OAuth, order placement and live broker WebSockets
    - Full original AI agent, PDF model views and advanced analytics
    - Guaranteed real-time exchange feeds

    Those modules need individual Python rewrites and broker/provider credentials. This app does not place trades.
    """)
    st.code("Streamlit entry point: app.py\nPython runtime: 3.11+", language="text")

st.divider()
st.caption("CRT Intelligence · Python / Streamlit edition · Market data may be delayed, incomplete or unavailable. Not financial advice.")

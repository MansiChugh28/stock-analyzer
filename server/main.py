from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
import numpy as np
import logging
import math
from typing import List
import pandas_ta as ta

from watchlist import router as watchlist_router
from indicators import router as indicators_router

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (configure for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(watchlist_router)
app.include_router(indicators_router)

# Logging config
logging.basicConfig(level=logging.INFO)

@app.get("/api/stock/{symbol}/analytics")
async def get_stock_analytics(
    symbol: str,
    period: str = "1mo",
    interval: str = "1d"
):
    try:
        logging.info(f"Fetching stock data: symbol={symbol}, period={period}, interval={interval}")
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)

        if df.empty:
            logging.error(f"No data found for symbol '{symbol}' with period='{period}' and interval='{interval}'")
            raise HTTPException(status_code=404, detail=f"No data found for symbol '{symbol}'.")

        df.reset_index(inplace=True)
        df['Date'] = df['Date'].astype(str)

        # Indicators
        df['SMA_20'] = ta.sma(df['Close'], length=20)
        df['EMA_20'] = ta.ema(df['Close'], length=20)
        df['RSI_14'] = ta.rsi(df['Close'], length=14)
        macd = ta.macd(df['Close'])

        if macd is not None and not macd.empty:
            df['MACD'] = macd['MACD']
            df['MACD_signal'] = macd['MACDs']
            df['MACD_hist'] = macd['MACDh']
        else:
            df[['MACD', 'MACD_signal', 'MACD_hist']] = None

        df['Trend'] = df.apply(
            lambda row: 'Uptrend' if pd.notna(row['SMA_20']) and row['Close'] > row['SMA_20'] else 'Downtrend',
            axis=1
        )

        df['Volume_SMA_20'] = ta.sma(df['Volume'], length=20)
        df['Volume_Spike'] = (df['Volume'] > 1.5 * df['Volume_SMA_20']) & pd.notna(df['Volume_SMA_20'])

        df.replace([np.inf, -np.inf], np.nan, inplace=True)

        def convert_np_types(obj):
            if isinstance(obj, dict):
                return {k: convert_np_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_np_types(i) for i in obj]
            elif isinstance(obj, (np.generic,)):
                return obj.item()
            elif isinstance(obj, float) and math.isnan(obj):
                return None
            else:
                return obj

        clean_data = convert_np_types(df.to_dict(orient='records'))

        # Summary
        summary_data = []
        if not df.empty:
            latest_price = df['Close'].iloc[-1] if 'Close' in df.columns else 0
            total_volume = df['Volume'].sum() if 'Volume' in df.columns else 0
            price_change_percent = 0

            if 'Close' in df.columns and len(df['Close']) > 1:
                first_price = df['Close'].iloc[0]
                if first_price and not pd.isna(first_price):
                    price_change_percent = ((latest_price - first_price) / first_price) * 100

            summary_data = [
                {
                    "name": "Latest Price",
                    "total": f"${latest_price:.2f}",
                    "change": f"{price_change_percent:.2f}%",
                    "icon": "📈" if price_change_percent >= 0 else "📉"
                },
                {
                    "name": "Total Volume",
                    "total": f"{total_volume:,.0f}",
                    "change": "",
                    "icon": ""
                },
            ]

        return {
            "symbol": symbol.upper(),
            "data": clean_data,
            "summary": summary_data
        }

    except Exception as e:
        logging.exception("Failed to fetch stock analytics.")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/watchlist")
async def get_watchlist_prices(symbols: List[str] = Query(..., alias="symbols[]")):
    try:
        results = []
        for symbol in symbols:
            ticker = yf.Ticker(symbol)
            info = ticker.info

            latest_price = info.get("regularMarketPrice")
            previous_close = info.get("previousClose")

            if latest_price is None or previous_close is None:
                logging.warning(f"Missing price data for {symbol}")
                continue

            change_percent = ((latest_price - previous_close) / previous_close) * 100

            results.append({
                "symbol": symbol,
                "latest_price": f"${latest_price:.2f}",
                "price_change_percent": f"{change_percent:.2f}%"
            })

        return {"watchlist": results}

    except Exception as e:
        logging.exception("Failed to fetch watchlist prices.")
        raise HTTPException(status_code=500, detail="Failed to fetch watchlist prices.")

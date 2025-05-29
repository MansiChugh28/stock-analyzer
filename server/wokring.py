from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import yfinance as yf
import logging
from portfolio import router as portfolio_router
from indicators import router as indicators_router

app = FastAPI()

# Enable CORS (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(portfolio_router)
app.include_router(indicators_router)

logging.basicConfig(level=logging.INFO)

@app.get("/api/stock/{symbol}")
async def get_stock_analytics(
    symbol: str,
    period: str = Query("1mo", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max)$"),
    interval: str = Query("1d", regex="^(1m|2m|5m|15m|30m|60m|90m|1d|5d|1wk|1mo|3mo)$")
):
    try:
        logging.info(f"Fetching analytics for {symbol} with period={period} and interval={interval}")
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)

        if df.empty:
            raise HTTPException(status_code=404, detail="No data found for symbol.")

        df.reset_index(inplace=True)
        df['Date'] = df['Date'].astype(str)

        # Get additional stock info
        info = ticker.info
        current_price = info.get("regularMarketPrice", 0)
        previous_close = info.get("previousClose", 0)
        change_percent = ((current_price - previous_close) / previous_close * 100) if previous_close else 0

        return {
            "data": df.to_dict(orient="records"),
            "current_price": current_price,
            "change_percent": change_percent,
            "company_name": info.get("longName", ""),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", "")
        }
    except Exception as e:
        logging.error(f"Error fetching stock data: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock data.")

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
                continue

            change_percent = ((latest_price - previous_close) / previous_close) * 100

            results.append({
                "symbol": symbol,
                "latest_price": f"${latest_price:.2f}",
                "price_change_percent": f"{change_percent:.2f}%"
            })

        return {"watchlist": results}
    except Exception as e:
        logging.error(f"Error fetching watchlist prices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch watchlist prices.")

from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd
import numpy as np
import logging
import pandas_ta as ta
from typing import List, Dict, Any

router = APIRouter()

def calculate_rsi(data: pd.DataFrame, period: int = 14) -> pd.Series:
    delta = data['Close'].diff()
    gain = delta.clip(lower=0).rolling(window=period).mean()
    loss = (-delta.clip(upper=0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_macd(data: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
    exp1 = data['Close'].ewm(span=fast, adjust=False).mean()
    exp2 = data['Close'].ewm(span=slow, adjust=False).mean()
    macd = exp1 - exp2
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    return {
        'MACD': macd,
        'MACD_signal': signal_line,
        'MACD_hist': macd - signal_line
    }

def calculate_sma(data: pd.DataFrame, period: int = 20) -> pd.Series:
    return data['Close'].rolling(window=period).mean()

def generate_trading_signals(data: pd.DataFrame) -> List[Dict[str, Any]]:
    signals = []

    rsi = calculate_rsi(data)
    if rsi.iloc[-1] < 30:
        signals.append({
            "signal": "Buy",
            "confidence": 80,
            "reason": f"RSI indicates oversold conditions (RSI: {rsi.iloc[-1]:.2f})"
        })
    elif rsi.iloc[-1] > 70:
        signals.append({
            "signal": "Sell",
            "confidence": 80,
            "reason": f"RSI indicates overbought conditions (RSI: {rsi.iloc[-1]:.2f})"
        })

    macd_data = calculate_macd(data)
    if macd_data['MACD'].iloc[-1] > macd_data['MACD_signal'].iloc[-1] and \
       macd_data['MACD'].iloc[-2] <= macd_data['MACD_signal'].iloc[-2]:
        signals.append({
            "signal": "Buy",
            "confidence": 70,
            "reason": "MACD line crossed above signal line (Bullish)"
        })
    elif macd_data['MACD'].iloc[-1] < macd_data['MACD_signal'].iloc[-1] and \
         macd_data['MACD'].iloc[-2] >= macd_data['MACD_signal'].iloc[-2]:
        signals.append({
            "signal": "Sell",
            "confidence": 70,
            "reason": "MACD line crossed below signal line (Bearish)"
        })

    sma_20 = calculate_sma(data, 20)
    sma_50 = calculate_sma(data, 50)
    if sma_20.iloc[-1] > sma_50.iloc[-1] and sma_20.iloc[-2] <= sma_50.iloc[-2]:
        signals.append({
            "signal": "Buy",
            "confidence": 65,
            "reason": "20-day SMA crossed above 50-day SMA (Golden Cross)"
        })
    elif sma_20.iloc[-1] < sma_50.iloc[-1] and sma_20.iloc[-2] >= sma_50.iloc[-2]:
        signals.append({
            "signal": "Sell",
            "confidence": 65,
            "reason": "20-day SMA crossed below 50-day SMA (Death Cross)"
        })

    return signals

@router.get("/api/indicators/{symbol}")
async def get_technical_indicators(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="6mo", interval="1d", actions=False)

        if data.empty or 'Close' not in data.columns:
            raise HTTPException(status_code=404, detail="No data found for symbol")

        rsi = calculate_rsi(data)
        macd_data = calculate_macd(data)
        sma_20 = calculate_sma(data, 20)
        sma_50 = calculate_sma(data, 50)

        return {
            "RSI_14": rsi.iloc[-1],
            "MACD": macd_data['MACD'].iloc[-1],
            "MACD_signal": macd_data['MACD_signal'].iloc[-1],
            "MACD_hist": macd_data['MACD_hist'].iloc[-1],
            "SMA_20": sma_20.iloc[-1],
            "SMA_50": sma_50.iloc[-1]
        }
    except Exception as e:
        logging.exception("Error calculating technical indicators")
        raise HTTPException(status_code=500, detail="Failed to calculate technical indicators")

@router.get("/api/signals/{symbol}")
async def get_trading_signals(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="6mo", interval="1d", actions=False)

        if data.empty or 'Close' not in data.columns:
            raise HTTPException(status_code=404, detail="No data found for symbol")

        signals = generate_trading_signals(data)
        return {"signals": signals}
    except Exception as e:
        logging.exception("Error generating trading signals")
        raise HTTPException(status_code=500, detail="Failed to generate trading signals")

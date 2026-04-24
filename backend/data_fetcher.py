import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional

#catalog
FUTURES_CATALOG = {
    "CL=F": {
        "name": "Crude Oil WTI",
        "asset_class": "Energy",
        "exchange": "NYMEX",
        "contract_size": 1000,
        "unit": "barrels",
        "currency": "USD",
    },
    "GC=F": {
        "name": "Gold",
        "asset_class": "Metals",
        "exchange": "COMEX",
        "contract_size": 100,
        "unit": "troy ounces",
        "currency": "USD",
    },
    "SI=F": {
        "name": "Silver",
        "asset_class": "Metals",
        "exchange": "COMEX",
        "contract_size": 5000,
        "unit": "troy ounces",
        "currency": "USD",
    },
    "ES=F": {
        "name": "S&P 500 E-mini",
        "asset_class": "Equity Index",
        "exchange": "CME",
        "contract_size": 50,
        "unit": "index points",
        "currency": "USD",
    },
    "NQ=F": {
        "name": "Nasdaq 100 E-mini",
        "asset_class": "Equity Index",
        "exchange": "CME",
        "contract_size": 20,
        "unit": "index points",
        "currency": "USD",
    },
    "ZN=F": {
        "name": "10-Year US Treasury Note",
        "asset_class": "Fixed Income",
        "exchange": "CBOT",
        "contract_size": 100000,
        "unit": "USD face value",
        "currency": "USD",
    },
    "ZB=F": {
        "name": "30-Year US Treasury Bond",
        "asset_class": "Fixed Income",
        "exchange": "CBOT",
        "contract_size": 100000,
        "unit": "USD face value",
        "currency": "USD",
    },
    "NG=F": {
        "name": "Natural Gas",
        "asset_class": "Energy",
        "exchange": "NYMEX",
        "contract_size": 10000,
        "unit": "MMBtu",
        "currency": "USD",
    },
    "HG=F": {
        "name": "Copper",
        "asset_class": "Metals",
        "exchange": "COMEX",
        "contract_size": 25000,
        "unit": "pounds",
        "currency": "USD",
    },
    "ZC=F": {
        "name": "Corn",
        "asset_class": "Agriculture",
        "exchange": "CBOT",
        "contract_size": 5000,
        "unit": "bushels",
        "currency": "USD",
    },
}

def get_futures_catalog() -> dict:
    """Return the catalog of supported futures contracts"""
    return FUTURES_CATALOG

def get_futures_history(
    ticker: str, 
    period: str = "1y",
    interval: str = "1d",
    ) -> pd.DataFrame:
    
    if ticker not in FUTURES_CATALOG:
        raise ValueError(f"Ticker {ticker} not in catalog")

    contract = yf.Ticker(ticker)
    df = contract.history(period=period, interval=interval)

    if df.empty:
        raise ValueError(f"No data returned for {ticker}")

    df.index = df.index.tz_localize(None)
    return df

def get_current_price(ticker: str) -> dict:
    
    if ticker not in FUTURES_CATALOG:
        raise ValueError(f"Ticker {ticker} not in catalog")
    
    df = get_futures_history(ticker, period="5d", interval="1d")
    
    if len(df) < 2:
        raise ValueError(f"Insufficient data for {ticker}")
    
    latest = df.iloc[-1]
    previous = df.iloc[-2]

    current_price = float(latest["Close"])
    previous_close = float(previous["Close"])
    change = current_price - previous_close
    change_pct = (change / previous_close) * 100

    return {
        "ticker": ticker,
        "name": FUTURES_CATALOG[ticker]["name"],
        "current_price": round(current_price, 4),
        "previous_close": round(previous_close, 4),
        "change": round(change, 4),
        "change_pct": round(change_pct, 2),
        "volume": int(latest["Volume"]) if pd.notna(latest["Volume"]) else 0,
        "last_updated": latest.name.strftime("%Y-%m-%d"),
    }
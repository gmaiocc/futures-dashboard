from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_fetcher import (
    get_futures_catalog,
    get_futures_history,
    get_current_price,
)

app = FastAPI(title="Futures Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Futures Dashboard API is running"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/futures/catalog")
def catalog():
    return get_futures_catalog()


@app.get("/api/futures/{ticker}/history")
def history(ticker: str, period: str = "1y", interval: str = "1d"):
    try:
        df = get_futures_history(ticker, period=period, interval=interval)

        data = [
            {
                "date": idx.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 4),
                "high": round(float(row["High"]), 4),
                "low": round(float(row["Low"]), 4),
                "close": round(float(row["Close"]), 4),
                "volume": int(row["Volume"]) if row["Volume"] else 0,
            }
            for idx, row in df.iterrows()
        ]

        return {
            "ticker": ticker,
            "period": period,
            "interval": interval,
            "data": data,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")


@app.get("/api/futures/{ticker}/quote")
def quote(ticker: str):
    """Get current price snapshot for a futures contract."""
    try:
        return get_current_price(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quote: {str(e)}")
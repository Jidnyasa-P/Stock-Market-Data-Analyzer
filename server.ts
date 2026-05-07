import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new (YahooFinance as any)();
import { SMA, RSI } from 'technicalindicators';
import db from './src/lib/db.ts';
import { v4 as uuidv4 } from 'uuid';

console.log("[Server] Starting with Node version:", process.version);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // --- API ROUTES ---

  // Search Stocks
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    console.log(`[API] Search request for: ${query}`);
    try {
      if (!query) return res.json([]);
      const results = await yahooFinance.search(query) as any;
      res.json(results.quotes);
    } catch (error) {
      console.error(`[API] Search failed for ${query}:`, error);
      res.status(500).json({ error: "Failed to search stocks" });
    }
  });

  // Get Historical Data + Indicators
  app.get("/api/stock/:symbol", async (req, res) => {
    const { symbol } = req.params;
    console.log(`[API] Fetching data for: ${symbol}`);
    try {
      // Use chart API which is more modern and often more reliable
      const result = await yahooFinance.chart(symbol, { 
        period1: '2023-01-01',
        interval: '1d'
      }) as any;
      
      const history = result.quotes;
      if (!history || history.length === 0) {
        return res.status(404).json({ error: "No historical data found for symbol" });
      }

      const closes = history.map((d: any) => d.close);
      
      // Calculate Indicators
      const sma20 = SMA.calculate({ period: 20, values: closes });
      const sma50 = SMA.calculate({ period: 50, values: closes });
      const rsi = RSI.calculate({ period: 14, values: closes });
      
      const data = history.map((d: any, i: number) => ({
        ...d,
        sma20: i >= 19 ? sma20[i - 19] : null,
        sma50: i >= 49 ? sma50[i - 49] : null,
        rsi: i >= 13 ? rsi[i - 13] : null,
      }));

      res.json({ symbol, history: data });
    } catch (error: any) {
      console.error(`[API] Data fetch failed for ${symbol}:`, error.message);
      if (error.subErrors) {
        console.error('[API] Validation sub-errors:', JSON.stringify(error.subErrors, null, 2));
      }
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  // Watchlist Operations
  app.get("/api/watchlist", (req, res) => {
    try {
      const list = db.prepare("SELECT * FROM watchlist ORDER BY added_at DESC").all();
      res.json(list);
    } catch (error) {
      console.error("[API] Watchlist fetch failed:", error);
      res.status(500).json({ error: "Database failure" });
    }
  });

  app.post("/api/watchlist", (req, res) => {
    const { symbol } = req.body;
    try {
      db.prepare("INSERT INTO watchlist (id, symbol) VALUES (?, ?)").run(uuidv4(), symbol);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Already in watchlist or DB error" });
    }
  });

  app.delete("/api/watchlist/:symbol", (req, res) => {
    try {
      db.prepare("DELETE FROM watchlist WHERE symbol = ?").run(req.params.symbol);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  // Backtest Logic (SMA Cross)
  app.post("/api/backtest", async (req, res) => {
    const { symbol, fast = 20, slow = 50 } = req.body;
    console.log(`[API] Running backtest for ${symbol} (${fast}/${slow})`);
    try {
      const result = await yahooFinance.chart(symbol, { 
        period1: '2023-01-01',
        interval: '1d'
      }) as any;
      const history = result.quotes;
      const closes = history.map((d: any) => d.close);
      
      const fastMA = SMA.calculate({ period: fast, values: closes });
      const slowMA = SMA.calculate({ period: slow, values: closes });
      
      let balance = 10000;
      let shares = 0;
      let trades = 0;

      for (let i = 1; i < fastMA.length; i++) {
        const fIdx = i;
        const sIdx = i - (slow - fast);
        if (sIdx < 0) continue;

        const currentFast = fastMA[fIdx];
        const currentSlow = slowMA[sIdx];
        const prevFast = fastMA[fIdx - 1];
        const prevSlow = slowMA[sIdx - 1];

        if (currentFast > currentSlow && prevFast <= prevSlow && balance > 0) {
          shares = balance / closes[fIdx + fast - 1];
          balance = 0;
          trades++;
        } else if (currentFast < currentSlow && prevFast >= prevSlow && shares > 0) {
          balance = shares * closes[fIdx + fast - 1];
          shares = 0;
          trades++;
        }
      }

      const finalValue = balance + (shares * closes[closes.length - 1]);
      const pnl = ((finalValue - 10000) / 10000) * 100;

      res.json({ symbol, pnl, trades, initial: 10000, final: finalValue });
    } catch (error) {
      console.error("[API] Backtest failed:", error);
      res.status(500).json({ error: "Backtest failed" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Configuring Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] ONLINE at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] FATAL STARTUP ERROR:", err);
});

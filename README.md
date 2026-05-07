# 📈 StockAnalyst Pro

A sophisticated Stock Market Data Analyzer built with modern full-stack technologies. This project solves the problem of manual data gathering and analysis by providing a unified window into technical indicators and strategy simulations.

![Dashboard Preview](https://images.unsplash.com/photo-1611974717535-7c446a0564cb?auto=format&fit=crop&q=80&w=1200)

## 🌟 Key Features

- **Real-Time Data Ingestion**: Seamless integration with Yahoo Finance for live price action and historical datasets.
- **Technical Indicator Engine**: 
  - **SMA (Simple Moving Average)**: 20 & 50-day windows for trend detection.
  - **RSI (Relative Strength Index)**: Overbought/Oversold momentum tracking.
  - **MACD**: Trend-following momentum indicators.
- **Strategy Backtester**: Vectorized simulation of SMA crossover strategies to quantify historical performance.
- **Interactive Visualizations**: High-performance charts using Recharts with multi-layer data views.
- **Smart Watchlist**: Persistent SQLite-backed tracking of your favorite assets.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion (Animations), Recharts (Visuals).
- **Backend**: Node.js (Express), `yahoo-finance2` (Data), `better-sqlite3` (Persistence).
- **Financial Logic**: `technicalindicators` library for robust signal processing.

## 📁 Folder Structure

```text
StockAnalyst-Pro/
├── src/
│   ├── components/    # Reusable UI components
│   ├── lib/          # DB helpers and utilities
│   ├── App.tsx       # Main Dashboard logic
│   └── types.ts      # Financial data interfaces
├── server.ts         # Express API with financial endpoints
├── market.db         # SQLite data store
├── package.json      # Dependency management
└── tsconfig.json     # TypeScript configuration
```

## 🚀 How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Preview**: 
   The application will be accessible at port 3000.

## 💡 Learning Outcomes

Through this project, I have implemented:
1. **Asynchronous API Integration**: Handling real-world financial data streams.
2. **Data Transformation**: Normalizing raw market data into time-series indicators.
3. **Financial Math**: Implementing trading logic and performance metrics (P&L calculations).
4. **Modern UI/UX**: Designing accessible, technical interfaces for data-heavy applications.

## ⚠️ Disclaimer

*This project is for educational purposes only. Financial analysis provided is simulated and based on historical data. It does not constitute financial advice. Always consult with a licensed professional for investment decisions.*

---
**Developed with ❤️ as a Portfolio Project**

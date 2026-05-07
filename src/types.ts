export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  rsi?: number;
}

export interface Watchlist {
  id: string;
  symbol: string;
  added_at: string;
}

export interface BacktestResult {
  symbol: string;
  pnl: number;
  trades: number;
  initial: number;
  final: number;
}

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { 
  Search, TrendingUp, TrendingDown, Clock, Plus, Trash2, 
  BarChart3, Activity, Briefcase, ChevronRight, Play, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StockData, Watchlist, BacktestResult } from './types.js';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<StockData[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [backtest, setBacktest] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        console.log('[Client] Server Status:', data.status);
      } catch (err) {
        console.error('[Client] Server unreachable');
      }
    };
    
    checkHealth();
    fetchStockData(ticker);
    fetchWatchlist();
  }, []);

  const fetchStockData = async (symbol: string) => {
    setLoading(true);
    setSearch(''); // Clear search on submit
    try {
      const res = await fetch(`/api/stock/${symbol}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
      setHistory(data.history);
      setTicker(symbol);
      setBacktest(null); // Reset backtest for new symbol
    } catch (err) {
      console.error('[Client] Data fetch failed:', err);
      // Optional: Add erratic state for UI
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to load watchlist');
      setWatchlist(data);
    } catch (err) {
      console.error('[Client] Watchlist load failed:', err);
    }
  };

  const addToWatchlist = async (symbol: string) => {
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol })
    });
    fetchWatchlist();
  };

  const removeFromWatchlist = async (symbol: string) => {
    await fetch(`/api/watchlist/${symbol}`, { method: 'DELETE' });
    fetchWatchlist();
  };

  const runBacktest = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: ticker })
      });
      const data = await res.json();
      setBacktest(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  const latestPrice = history[history.length - 1];
  const prevPrice = history[history.length - 2];
  const priceChange = latestPrice && prevPrice ? latestPrice.close - prevPrice.close : 0;
  const priceChangePercent = latestPrice && prevPrice ? (priceChange / prevPrice.close) * 100 : 0;

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text p-6 lg:p-12 selection:bg-editorial-accent selection:text-white">
      {/* Decorative Sidebar */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-12 opacity-30 pointer-events-none hidden xl:flex">
        <div className="vertical-text text-[9px] uppercase font-bold tracking-widest-plus">
          Markets are Thinking Made Visual — Vol. 04
        </div>
      </div>

      <header className="max-w-7xl mx-auto flex justify-between items-baseline mb-16 border-b border-black/20 pb-6">
        <div className="flex items-center gap-4">
          <TrendingUp className="w-6 h-6 text-editorial-accent" />
          <div className="text-2xl font-black tracking-tighter uppercase leading-none">Market_Index</div>
        </div>
        
        <nav className="hidden md:flex gap-12 text-[11px] font-bold uppercase tracking-widest leading-none">
          <div className="relative group">
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStockData(search.toUpperCase())}
              placeholder="SEARCH ASSET_"
              className="bg-transparent border-b border-black/10 outline-none w-32 focus:w-48 transition-all px-0 py-1"
            />
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 opacity-30" />
          </div>
          <a href="#" className="hover:opacity-50 transition-opacity">Archive</a>
          <a href="#" className="hover:opacity-50 transition-opacity strikethrough">Legacy</a>
          <span className="opacity-30 underline cursor-pointer">Live/Sync</span>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-12 items-stretch">
        {/* Left Section: Title & Charts */}
        <section className="col-span-12 lg:col-span-8 flex flex-col justify-between">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] uppercase tracking-widest-plus font-bold opacity-60">Vol. 04 / Financial Analysis</span>
              <div className="h-[1px] flex-1 bg-black/10"></div>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <h1 className="font-display text-[80px] md:text-[120px] leading-[0.85] tracking-[-0.04em]">
                {ticker}<br/>
                <span className="italic text-editorial-accent font-display tracking-tighter">Dynamics_</span>
              </h1>
              
              <div className="text-right mt-4">
                <div className="text-4xl font-mono font-bold tracking-tighter">
                  ${latestPrice?.close?.toFixed(2) || '---'}
                </div>
                <div className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  priceChange >= 0 ? "text-emerald-700" : "text-rose-700"
                )}>
                  {priceChange >= 0 ? '+' : ''}{priceChange?.toFixed(2) || '0.00'} ({priceChangePercent?.toFixed(2) || '0.00'}%)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="w-16 h-[2px] bg-black"></div>
              <p className="text-sm leading-relaxed serif italic opacity-70">
                Evaluating the volatility and trend structures of {ticker}. Analyzing moving average crossovers as a proxy for institutional framework shifts.
              </p>
              <button 
                onClick={() => addToWatchlist(ticker)}
                className="w-fit text-[11px] font-bold uppercase tracking-widest border border-black/20 px-6 py-2 hover:bg-black hover:text-white transition-all"
              >
                + Add to Inventory
              </button>
            </div>
            
            <div className="md:col-span-8 aspect-video border border-black/10 p-6 bg-white shadow-sm relative overflow-hidden">
               <div className="absolute top-4 left-6 text-[9px] uppercase font-bold opacity-30 z-10">Chart: Analysis_{ticker}</div>
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ border: 'none', backgroundColor: '#fff', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="stepBefore" dataKey="close" stroke="#000" fillOpacity={0.05} fill="#000" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="sma20" stroke="#C2410C" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Right Section: Inventory & Reports */}
        <section className="col-span-12 lg:col-span-4 border-l border-black/20 pl-0 lg:pl-12 flex flex-col">
          <div className="mb-12">
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-8 border-b border-black/20 pb-2 flex justify-between">
              Active Inventory <span>[ {watchlist.length} ]</span>
            </h3>
            <ul className="space-y-8">
              {watchlist.map((item, idx) => (
                <li key={item.id} className="group cursor-pointer">
                  <span className="block text-[10px] opacity-40 font-mono">0{idx + 1}.</span>
                  <div className="flex justify-between items-end" onClick={() => fetchStockData(item.symbol)}>
                    <span className="text-xl font-bold uppercase hover:text-editorial-accent transition-colors">
                      {item.symbol}
                      {item.symbol === ticker && <span className="ml-2 italic text-sm text-editorial-accent serif">Current_</span>}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.symbol); }}
                      className="text-[9px] uppercase font-mono opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
                    >
                      [ Remove ]
                    </button>
                  </div>
                </li>
              ))}
              {watchlist.length === 0 && (
                <li className="text-xs italic opacity-40 serif">Nothing cataloged in current session.</li>
              )}
            </ul>
          </div>

          <div className="mt-8 space-y-6">
            <div className="p-8 border border-black/10 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest">Strategy_Report</h4>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              
              {backtest ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                    <span className="text-xs uppercase opacity-60">PnL Struct</span>
                    <span className={cn("text-lg font-mono font-bold", backtest.pnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {backtest.pnl >= 0 ? '+' : ''}{backtest.pnl?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs uppercase opacity-60">Frequency</span>
                    <span className="text-lg font-mono font-bold">{backtest.trades} / Trades</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 opacity-50">
                  <p className="text-xs leading-normal serif">Simulate SMA Crossover framework to evaluate historical risk structures.</p>
                  <button 
                    onClick={runBacktest}
                    disabled={isRefreshing}
                    className="w-full text-[11px] font-bold uppercase tracking-widest border border-black/20 py-2 hover:border-black transition-colors"
                  >
                    {isRefreshing ? 'Initializing...' : 'Execute Backtest'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 bg-black text-white rounded-sm shadow-xl">
              <h4 className="text-[10px] uppercase font-bold mb-4 tracking-widest flex justify-between items-center">
                System_Status <span className="font-mono opacity-50">14:23:09 GMT</span>
              </h4>
              <p className="text-xs leading-relaxed opacity-70 mb-6 font-mono">
                {latestPrice ? `Sync complete for ${ticker}. Current RSI cataloged at ${latestPrice.rsi?.toFixed(2) || '---'}. Analysis nodes optimized.` : 'Standing by for asset selection.'}
              </p>
              <div className="flex justify-between items-center">
                 <div className="text-[9px] uppercase font-bold">52.5200° N, 13.4050° E</div>
                 <ChevronRight className="w-4 h-4 opacity-50" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 flex flex-col md:flex-row justify-between items-center border-t border-black/20 pt-8 pb-12 gap-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">{new Date().toISOString().split('T')[0]} / {new Date().toLocaleTimeString()}</div>
          <div className="text-[10px] font-bold uppercase opacity-40">Asset Framework Vol. 04</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-32 h-[1px] bg-black/20 hidden sm:block"></div>
          <div className="text-[10px] font-bold uppercase tracking-widest">© StockAnalyst Pro / Archive</div>
        </div>
      </footer>
    </div>
  );
}

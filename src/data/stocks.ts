// Generate realistic historical price data
function generatePriceHistory(basePrice: number, days: number, volatility: number = 0.02): { date: string; open: number; high: number; low: number; close: number; volume: number }[] {
  const data = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * volatility * price;
    const open = +(price + (Math.random() - 0.5) * price * 0.01).toFixed(2);
    price = +(price + change).toFixed(2);
    const close = price;
    const high = +(Math.max(open, close) + Math.random() * price * 0.015).toFixed(2);
    const low = +(Math.min(open, close) - Math.random() * price * 0.015).toFixed(2);
    const volume = Math.floor(Math.random() * 50000000 + 5000000);

    data.push({
      date: date.toISOString().split('T')[0],
      open, high, low, close, volume,
    });
  }
  return data;
}

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  volume: number;
  avgVolume: number;
  high52w: number;
  low52w: number;
  history: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
}

const stockDefinitions = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", base: 178.50, mc: "2.8T", pe: 28.5 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", base: 378.90, mc: "2.8T", pe: 35.2 },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", base: 141.20, mc: "1.7T", pe: 25.8 },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical", base: 178.30, mc: "1.8T", pe: 62.4 },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", base: 875.40, mc: "2.1T", pe: 72.1 },
  { ticker: "META", name: "Meta Platforms Inc.", sector: "Technology", base: 505.80, mc: "1.3T", pe: 33.6 },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical", base: 175.20, mc: "557B", pe: 43.8 },
  { ticker: "BRK.B", name: "Berkshire Hathaway", sector: "Financial", base: 408.50, mc: "890B", pe: 8.9 },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financial", base: 198.40, mc: "571B", pe: 11.8 },
  { ticker: "V", name: "Visa Inc.", sector: "Financial", base: 279.60, mc: "574B", pe: 30.2 },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", base: 156.30, mc: "376B", pe: 10.5 },
  { ticker: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive", base: 168.80, mc: "454B", pe: 27.3 },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Defensive", base: 162.40, mc: "383B", pe: 26.1 },
  { ticker: "MA", name: "Mastercard Inc.", sector: "Financial", base: 458.90, mc: "427B", pe: 35.7 },
  { ticker: "HD", name: "Home Depot Inc.", sector: "Consumer Cyclical", base: 345.70, mc: "344B", pe: 23.4 },
  { ticker: "XOM", name: "Exxon Mobil Corp.", sector: "Energy", base: 104.60, mc: "430B", pe: 10.2 },
  { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", base: 527.30, mc: "486B", pe: 22.1 },
  { ticker: "DIS", name: "Walt Disney Co.", sector: "Communication", base: 112.40, mc: "205B", pe: 68.2 },
  { ticker: "NFLX", name: "Netflix Inc.", sector: "Communication", base: 628.50, mc: "272B", pe: 47.3 },
  { ticker: "INTC", name: "Intel Corp.", sector: "Technology", base: 43.80, mc: "185B", pe: 108.5 },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "Technology", base: 177.60, mc: "287B", pe: 46.9 },
  { ticker: "CRM", name: "Salesforce Inc.", sector: "Technology", base: 272.40, mc: "264B", pe: 54.2 },
  { ticker: "COST", name: "Costco Wholesale", sector: "Consumer Defensive", base: 725.30, mc: "322B", pe: 48.6 },
  { ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare", base: 27.80, mc: "157B", pe: 18.3 },
  { ticker: "KO", name: "Coca-Cola Co.", sector: "Consumer Defensive", base: 60.40, mc: "261B", pe: 23.8 },
];

export const stocks: Stock[] = stockDefinitions.map(s => {
  const history = generatePriceHistory(s.base, 365, 0.02);
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const change = +(last.close - prev.close).toFixed(2);
  const changePercent = +((change / prev.close) * 100).toFixed(2);
  const prices = history.map(h => h.close);

  return {
    ticker: s.ticker,
    name: s.name,
    sector: s.sector,
    price: last.close,
    change,
    changePercent,
    marketCap: s.mc,
    peRatio: s.pe,
    volume: last.volume,
    avgVolume: Math.floor(history.reduce((a, h) => a + h.volume, 0) / history.length),
    high52w: +Math.max(...prices).toFixed(2),
    low52w: +Math.min(...prices).toFixed(2),
    history,
  };
});

export const marketIndices = [
  { name: "S&P 500", ticker: "SPX", value: 5021.84, change: 15.29, changePercent: 0.31 },
  { name: "NASDAQ", ticker: "IXIC", value: 15996.82, change: -22.13, changePercent: -0.14 },
  { name: "DOW JONES", ticker: "DJI", value: 38996.39, change: 125.69, changePercent: 0.32 },
];

export function getStock(ticker: string): Stock | undefined {
  return stocks.find(s => s.ticker === ticker);
}

export function getTopGainers(count = 5): Stock[] {
  return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, count);
}

export function getTopLosers(count = 5): Stock[] {
  return [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, count);
}

export function searchStocks(query: string): Stock[] {
  const q = query.toLowerCase();
  return stocks.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
}

export function getSectors(): string[] {
  return [...new Set(stocks.map(s => s.sector))];
}

// Technical indicators
export function calculateSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return +(slice.reduce((a, b) => a + b, 0) / period).toFixed(2);
  });
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const ema: (number | null)[] = [];
  let prev: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      ema.push(+prev.toFixed(2));
    } else {
      prev = data[i] * k + prev! * (1 - k);
      ema.push(+prev.toFixed(2));
    }
  }
  return ema;
}

export function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  let gains = 0, losses = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) { rsi.push(null); continue; }
    const diff = data[i] - data[i - 1];
    if (i <= period) {
      if (diff > 0) gains += diff; else losses -= diff;
      if (i < period) { rsi.push(null); continue; }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      rsi.push(avgLoss === 0 ? 100 : +(100 - 100 / (1 + avgGain / avgLoss)).toFixed(2));
    } else {
      const avgGain = ((gains * (period - 1)) + (diff > 0 ? diff : 0)) / period;
      const avgLoss = ((losses * (period - 1)) + (diff < 0 ? -diff : 0)) / period;
      gains = avgGain; losses = avgLoss;
      rsi.push(avgLoss === 0 ? 100 : +(100 - 100 / (1 + avgGain / avgLoss)).toFixed(2));
    }
  }
  return rsi;
}

export function calculateMACD(data: number[]): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macdLine = ema12.map((v, i) => (v !== null && ema26[i] !== null) ? +(v - ema26[i]!).toFixed(2) : null);
  const macdValues = macdLine.filter(v => v !== null) as number[];
  const signalRaw = calculateEMA(macdValues, 9);
  
  let si = 0;
  const signal = macdLine.map(v => {
    if (v === null) return null;
    const s = signalRaw[si++];
    return s;
  });
  
  const histogram = macdLine.map((v, i) => (v !== null && signal[i] !== null) ? +(v - signal[i]!).toFixed(2) : null);
  
  return { macd: macdLine, signal, histogram };
}

export function getPrediction(stock: Stock): { signal: 'Buy' | 'Sell' | 'Hold'; confidence: number; reason: string } {
  const closes = stock.history.map(h => h.close);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const rsi = calculateRSI(closes);
  
  const lastSma20 = sma20[sma20.length - 1];
  const lastSma50 = sma50[sma50.length - 1];
  const lastRsi = rsi[rsi.length - 1];
  const lastPrice = closes[closes.length - 1];
  
  let score = 0;
  const reasons: string[] = [];
  
  if (lastSma20 && lastSma50) {
    if (lastSma20 > lastSma50) { score += 2; reasons.push("SMA20 above SMA50 (bullish crossover)"); }
    else { score -= 2; reasons.push("SMA20 below SMA50 (bearish crossover)"); }
  }
  
  if (lastPrice && lastSma20) {
    if (lastPrice > lastSma20) { score += 1; reasons.push("Price above SMA20"); }
    else { score -= 1; reasons.push("Price below SMA20"); }
  }
  
  if (lastRsi !== null) {
    if (lastRsi < 30) { score += 2; reasons.push(`RSI oversold at ${lastRsi}`); }
    else if (lastRsi > 70) { score -= 2; reasons.push(`RSI overbought at ${lastRsi}`); }
    else { reasons.push(`RSI neutral at ${lastRsi}`); }
  }
  
  const signal = score >= 2 ? 'Buy' : score <= -2 ? 'Sell' : 'Hold';
  const confidence = Math.min(Math.abs(score) * 18 + 20, 95);
  
  return { signal, confidence, reason: reasons.join('. ') };
}

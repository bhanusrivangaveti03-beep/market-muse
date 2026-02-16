
# Stock Market Dashboard & Analysis App

A comprehensive, visually rich stock market web application for an academic project — built with React, TypeScript, and Tailwind CSS.

## Pages & Features

### 1. Dashboard (Home)
- Market overview with key indices (S&P 500, NASDAQ, DOW) displayed as cards with simulated real-time data
- Top gainers and losers table
- Market sentiment indicator (bull/bear gauge)
- Quick search bar to look up any stock ticker

### 2. Stock Detail Page
- Interactive price chart (line/candlestick) using Recharts with time range selectors (1D, 1W, 1M, 3M, 1Y)
- Key statistics panel (open, high, low, volume, market cap, P/E ratio)
- Simulated "prediction" section showing trend analysis with moving averages and projected direction (up/down/neutral) — presented as a visual indicator
- Historical data table

### 3. Portfolio Tracker
- Add stocks to a virtual portfolio with buy price and quantity
- Track total portfolio value, gains/losses, and allocation breakdown
- Pie chart showing portfolio distribution
- Performance over time line chart

### 4. Stock Screener
- Filter stocks by criteria: price range, market cap, sector, volume
- Sortable results table
- Quick-add to portfolio

### 5. Prediction/Analysis View
- Display pre-defined technical indicators (SMA, EMA, RSI, MACD) as charts
- Simple trend prediction based on moving average crossover logic (calculated in the browser with JavaScript)
- Buy/Sell/Hold recommendation display with confidence meter
- Disclaimer noting this is for educational purposes only

## Design
- Clean, professional dark theme with green/red accent colors for gains/losses
- Responsive layout with sidebar navigation
- Card-based design with subtle animations
- Data visualizations using Recharts

## Data Approach
- Use sample/mock stock data stored locally (JSON) so the app works without external APIs
- ~20-30 popular stock tickers with realistic historical price data
- No backend or database needed — everything runs in the browser

This gives you a polished, feature-rich project that demonstrates data visualization, analysis concepts, and modern web development — perfect for an academic submission.

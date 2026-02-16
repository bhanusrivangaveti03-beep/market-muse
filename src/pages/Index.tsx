import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Search, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { marketIndices, getTopGainers, getTopLosers, searchStocks, stocks } from "@/data/stocks";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const results = query.length > 0 ? searchStocks(query) : [];
  const gainers = getTopGainers(5);
  const losers = getTopLosers(5);

  // Sentiment: average changePercent of all stocks
  const avgChange = stocks.reduce((a, s) => a + s.changePercent, 0) / stocks.length;
  const sentimentScore = Math.min(Math.max((avgChange + 2) / 4 * 100, 5), 95);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time market overview & analysis</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stocks (e.g. AAPL, Tesla)..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border bg-popover shadow-lg">
              {results.slice(0, 6).map((s) => (
                <button
                  key={s.ticker}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-accent"
                  onClick={() => { navigate(`/stock/${s.ticker}`); setQuery(""); }}
                >
                  <span className="font-medium">{s.ticker}</span>
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className={s.change >= 0 ? "text-gain" : "text-loss"}>
                    {s.change >= 0 ? "+" : ""}{s.changePercent}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market Indices */}
      <div className="grid gap-4 md:grid-cols-3">
        {marketIndices.map((idx) => (
          <Card key={idx.ticker} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{idx.ticker}</p>
                  <p className="text-lg font-bold">{idx.name}</p>
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${idx.change >= 0 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                  {idx.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent}%
                </div>
              </div>
              <p className="mt-2 text-2xl font-mono font-bold">{idx.value.toLocaleString()}</p>
              <p className={`text-sm ${idx.change >= 0 ? "text-gain" : "text-loss"}`}>
                {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sentiment + Mini Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Bearish</span>
                  <span>Bullish</span>
                </div>
                <div className="h-4 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sentimentScore}%`,
                      background: `linear-gradient(90deg, hsl(0 72% 51%), hsl(45 93% 47%), hsl(142 71% 45%))`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${sentimentScore > 55 ? "text-gain" : sentimentScore < 45 ? "text-loss" : "text-neutral-stock"}`}>
                  {sentimentScore.toFixed(0)}%
                </span>
                <p className="text-xs text-muted-foreground">
                  {sentimentScore > 55 ? "Bullish" : sentimentScore < 45 ? "Bearish" : "Neutral"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">S&P 500 Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={stocks[0].history.slice(-30)}>
                <defs>
                  <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="close" stroke="hsl(217 91% 60%)" fill="url(#spGrad)" strokeWidth={2} dot={false} />
                <XAxis dataKey="date" hide />
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip labelFormatter={(l) => l} formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gainers & Losers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-gain" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gainers.map((s) => (
                  <TableRow key={s.ticker} className="cursor-pointer" onClick={() => navigate(`/stock/${s.ticker}`)}>
                    <TableCell className="font-medium">{s.ticker}</TableCell>
                    <TableCell className="font-mono">${s.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-gain font-medium">+{s.changePercent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-loss" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {losers.map((s) => (
                  <TableRow key={s.ticker} className="cursor-pointer" onClick={() => navigate(`/stock/${s.ticker}`)}>
                    <TableCell className="font-medium">{s.ticker}</TableCell>
                    <TableCell className="font-mono">${s.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-loss font-medium">{s.changePercent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

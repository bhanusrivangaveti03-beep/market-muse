import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStock, calculateSMA, calculateEMA, getPrediction } from "@/data/stocks";
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar
} from "recharts";
import { Badge } from "@/components/ui/badge";

const ranges = [
  { label: "1W", days: 5 },
  { label: "1M", days: 22 },
  { label: "3M", days: 66 },
  { label: "6M", days: 132 },
  { label: "1Y", days: 252 },
];

const StockDetail = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const stock = getStock(ticker || "");
  const [range, setRange] = useState("3M");

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-xl text-muted-foreground">Stock not found</p>
        <Link to="/"><Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
      </div>
    );
  }

  const prediction = getPrediction(stock);
  const selectedRange = ranges.find(r => r.label === range)!;
  const chartData = stock.history.slice(-selectedRange.days);
  const closes = stock.history.map(h => h.close);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  const chartWithIndicators = stock.history.slice(-selectedRange.days).map((h, i) => {
    const idx = stock.history.length - selectedRange.days + i;
    return { ...h, sma20: sma20[idx], sma50: sma50[idx] };
  });

  const isPositive = stock.change >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{stock.ticker}</h1>
            <Badge variant="secondary">{stock.sector}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{stock.name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-mono font-bold">${stock.price.toFixed(2)}</p>
          <p className={`flex items-center justify-end gap-1 text-sm font-medium ${isPositive ? "text-gain" : "text-loss"}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent}%)
          </p>
        </div>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Price Chart</CardTitle>
          <div className="flex gap-1">
            {ranges.map(r => (
              <Button key={r.label} variant={range === r.label ? "default" : "ghost"} size="sm" onClick={() => setRange(r.label)}>
                {r.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartWithIndicators}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? "hsl(142 71% 45%)" : "hsl(0 72% 51%)"} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={isPositive ? "hsl(142 71% 45%)" : "hsl(0 72% 51%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(215 20% 55%)" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="hsl(215 20% 55%)" />
              <Tooltip contentStyle={{ background: "hsl(223 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="close" stroke={isPositive ? "hsl(142 71% 45%)" : "hsl(0 72% 51%)"} fill="url(#priceGrad)" strokeWidth={2} dot={false} name="Price" />
              <Line type="monotone" dataKey="sma20" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} name="SMA 20" strokeDasharray="4 2" />
              <Line type="monotone" dataKey="sma50" stroke="hsl(45 93% 47%)" strokeWidth={1.5} dot={false} name="SMA 50" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Key Stats */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Key Statistics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Open", value: `$${chartData[chartData.length - 1]?.open.toFixed(2)}` },
                { label: "High", value: `$${chartData[chartData.length - 1]?.high.toFixed(2)}` },
                { label: "Low", value: `$${chartData[chartData.length - 1]?.low.toFixed(2)}` },
                { label: "Volume", value: (stock.volume / 1e6).toFixed(1) + "M" },
                { label: "Market Cap", value: stock.marketCap },
                { label: "P/E Ratio", value: stock.peRatio.toFixed(1) },
                { label: "52W High", value: `$${stock.high52w}` },
                { label: "52W Low", value: `$${stock.low52w}` },
              ].map(stat => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-mono font-medium">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prediction */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Trend Prediction</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className={`mb-3 rounded-full px-6 py-3 text-lg font-bold ${
              prediction.signal === "Buy" ? "bg-gain/10 text-gain" :
              prediction.signal === "Sell" ? "bg-loss/10 text-loss" :
              "bg-secondary text-neutral-stock"
            }`}>
              {prediction.signal}
            </div>
            <div className="w-full">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{prediction.confidence}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${prediction.confidence}%` }} />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center">{prediction.reason}</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Volume</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="hsl(215 20% 55%)" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} stroke="hsl(215 20% 55%)" />
              <Tooltip formatter={(v: number) => [(v / 1e6).toFixed(1) + "M", "Volume"]} />
              <Bar dataKey="volume" fill="hsl(217 91% 60%)" opacity={0.6} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Historical Data Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Historical Data</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>High</TableHead>
                <TableHead>Low</TableHead>
                <TableHead>Close</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...chartData].reverse().slice(0, 20).map((d) => (
                <TableRow key={d.date}>
                  <TableCell>{d.date}</TableCell>
                  <TableCell className="font-mono">${d.open.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">${d.high.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">${d.low.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">${d.close.toFixed(2)}</TableCell>
                  <TableCell className="font-mono">{(d.volume / 1e6).toFixed(1)}M</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        ⚠️ This is simulated data for educational purposes only. Not financial advice.
      </p>
    </div>
  );
};

export default StockDetail;

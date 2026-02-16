import { useState } from "react";
import { Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { stocks, calculateSMA, calculateEMA, calculateRSI, calculateMACD, getPrediction, type Stock } from "@/data/stocks";
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine
} from "recharts";

const Analysis = () => {
  const [ticker, setTicker] = useState("AAPL");
  const stock = stocks.find(s => s.ticker === ticker)!;
  const closes = stock.history.map(h => h.close);
  const last90 = stock.history.slice(-90);

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const ema12 = calculateEMA(closes, 12);
  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const prediction = getPrediction(stock);

  const offset = closes.length - 90;
  const chartData = last90.map((h, i) => ({
    date: h.date,
    price: h.close,
    sma20: sma20[offset + i],
    sma50: sma50[offset + i],
    ema12: ema12[offset + i],
    rsi: rsi[offset + i],
    macd: macd.macd[offset + i],
    signal: macd.signal[offset + i],
    histogram: macd.histogram[offset + i],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Technical Analysis</h1>
          <p className="text-sm text-muted-foreground">Indicators & trend prediction</p>
        </div>
        <Select value={ticker} onValueChange={setTicker}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            {stocks.map(s => <SelectItem key={s.ticker} value={s.ticker}>{s.ticker} — {s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Prediction Card */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-full px-8 py-4 text-2xl font-bold ${
              prediction.signal === "Buy" ? "bg-gain/10 text-gain" :
              prediction.signal === "Sell" ? "bg-loss/10 text-loss" :
              "bg-secondary text-neutral-stock"
            }`}>
              {prediction.signal}
            </div>
            <div>
              <p className="font-medium">{stock.ticker} — {stock.name}</p>
              <p className="text-sm text-muted-foreground">{prediction.reason}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-3 w-32 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${prediction.confidence}%` }} />
              </div>
              <span className="font-mono font-medium text-sm">{prediction.confidence}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price with Moving Averages */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Price & Moving Averages</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} stroke="hsl(215 20% 55%)" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} stroke="hsl(215 20% 55%)" />
              <Tooltip contentStyle={{ background: "hsl(223 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="price" stroke="hsl(210 40% 95%)" strokeWidth={2} dot={false} name="Price" />
              <Line type="monotone" dataKey="sma20" stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} name="SMA 20" />
              <Line type="monotone" dataKey="sma50" stroke="hsl(45 93% 47%)" strokeWidth={1.5} dot={false} name="SMA 50" />
              <Line type="monotone" dataKey="ema12" stroke="hsl(262 83% 58%)" strokeWidth={1.5} dot={false} name="EMA 12" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* RSI */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">RSI (14)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} stroke="hsl(215 20% 55%)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(215 20% 55%)" />
                <Tooltip contentStyle={{ background: "hsl(223 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8 }} />
                <ReferenceLine y={70} stroke="hsl(0 72% 51%)" strokeDasharray="3 3" label={{ value: "Overbought", position: "right", fill: "hsl(0 72% 51%)", fontSize: 10 }} />
                <ReferenceLine y={30} stroke="hsl(142 71% 45%)" strokeDasharray="3 3" label={{ value: "Oversold", position: "right", fill: "hsl(142 71% 45%)", fontSize: 10 }} />
                <Line type="monotone" dataKey="rsi" stroke="hsl(262 83% 58%)" strokeWidth={2} dot={false} name="RSI" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MACD */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">MACD</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} stroke="hsl(215 20% 55%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(215 20% 55%)" />
                <Tooltip contentStyle={{ background: "hsl(223 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8 }} />
                <ReferenceLine y={0} stroke="hsl(215 20% 55%)" />
                <Bar dataKey="histogram" name="Histogram">
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={(d.histogram ?? 0) >= 0 ? "hsl(142 71% 45%)" : "hsl(0 72% 51%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          ⚠️ <strong>Disclaimer:</strong> This analysis uses simulated data and simplified technical indicators for educational purposes only.
          It does not constitute financial advice. Always consult a qualified financial advisor before making investment decisions.
        </CardContent>
      </Card>
    </div>
  );
};

export default Analysis;

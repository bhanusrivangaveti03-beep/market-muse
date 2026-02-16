import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getStock, stocks } from "@/data/stocks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface Holding {
  ticker: string;
  shares: number;
  buyPrice: number;
}

const COLORS = [
  "hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(0 72% 51%)", "hsl(45 93% 47%)",
  "hsl(262 83% 58%)", "hsl(190 80% 50%)", "hsl(30 80% 55%)", "hsl(330 70% 55%)",
];

const Portfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: "AAPL", shares: 10, buyPrice: 150 },
    { ticker: "MSFT", shares: 5, buyPrice: 350 },
    { ticker: "GOOGL", shares: 8, buyPrice: 130 },
    { ticker: "NVDA", shares: 3, buyPrice: 700 },
  ]);
  const [newTicker, setNewTicker] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [open, setOpen] = useState(false);

  const portfolioData = holdings.map(h => {
    const stock = getStock(h.ticker);
    const currentPrice = stock?.price || 0;
    const currentValue = currentPrice * h.shares;
    const costBasis = h.buyPrice * h.shares;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    return { ...h, currentPrice, currentValue, costBasis, gainLoss, gainLossPercent, name: stock?.name || h.ticker };
  });

  const totalValue = portfolioData.reduce((a, p) => a + p.currentValue, 0);
  const totalCost = portfolioData.reduce((a, p) => a + p.costBasis, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const pieData = portfolioData.map(p => ({ name: p.ticker, value: +p.currentValue.toFixed(2) }));

  const addHolding = () => {
    const t = newTicker.toUpperCase().trim();
    if (!t || !getStock(t)) return;
    setHoldings(prev => [...prev, { ticker: t, shares: +newShares || 1, buyPrice: +newPrice || (getStock(t)?.price || 0) }]);
    setNewTicker(""); setNewShares(""); setNewPrice(""); setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
          <p className="text-sm text-muted-foreground">Track your virtual stock portfolio</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Stock to Portfolio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Ticker</Label><Input placeholder="AAPL" value={newTicker} onChange={e => setNewTicker(e.target.value)} /></div>
              <div><Label>Shares</Label><Input type="number" placeholder="10" value={newShares} onChange={e => setNewShares(e.target.value)} /></div>
              <div><Label>Buy Price</Label><Input type="number" placeholder="150.00" value={newPrice} onChange={e => setNewPrice(e.target.value)} /></div>
              <Button onClick={addHolding} className="w-full">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-mono font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-2xl font-mono font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Gain/Loss</p>
            <p className={`text-2xl font-mono font-bold ${totalGain >= 0 ? "text-gain" : "text-loss"}`}>
              {totalGain >= 0 ? "+" : ""}${totalGain.toFixed(2)} ({totalGainPercent >= 0 ? "+" : ""}{totalGainPercent.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Allocation</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Holdings</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Gain/Loss</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioData.map(p => (
                  <TableRow key={p.ticker}>
                    <TableCell className="font-medium">{p.ticker}</TableCell>
                    <TableCell>{p.shares}</TableCell>
                    <TableCell className="font-mono">${p.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className={`font-mono ${p.gainLoss >= 0 ? "text-gain" : "text-loss"}`}>
                      {p.gainLoss >= 0 ? "+" : ""}{p.gainLossPercent.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setHoldings(prev => prev.filter(h => h.ticker !== p.ticker))}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </TableCell>
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

export default Portfolio;

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getStock, stocks } from "@/data/stocks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const portfolioData = holdings.map(h => {
    const stock = getStock(h.ticker);
    const currentPrice = stock?.price || h.buyPrice;
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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const t = newTicker.toUpperCase().trim();
    if (!t) {
      errors.ticker = "Ticker is required";
    } else {
      const stock = getStock(t);
      if (!stock) {
        const available = stocks.map(s => s.ticker).join(", ");
        errors.ticker = `Ticker "${t}" not found. Available: ${available.substring(0, 80)}...`;
      }
      if (holdings.find(h => h.ticker === t)) {
        errors.ticker = `${t} is already in your portfolio`;
      }
    }
    if (!newShares || Number(newShares) <= 0) errors.shares = "Enter a valid number of shares";
    if (newPrice && Number(newPrice) < 0) errors.price = "Price cannot be negative";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addHolding = async () => {
    if (!validateForm()) return;
    setLoading(true);
    // Simulate async operation
    await new Promise(r => setTimeout(r, 500));
    const t = newTicker.toUpperCase().trim();
    const stock = getStock(t);
    const price = +newPrice || stock?.price || 0;
    setHoldings(prev => [...prev, { ticker: t, shares: +newShares, buyPrice: price }]);
    setNewTicker("");
    setNewShares("");
    setNewPrice("");
    setFormErrors({});
    setOpen(false);
    setLoading(false);
    toast.success(`${t} added to your portfolio!`);
  };

  const removeHolding = (ticker: string) => {
    setHoldings(prev => prev.filter(h => h.ticker !== ticker));
    toast.success(`${ticker} removed from portfolio`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
          <p className="text-sm text-muted-foreground">Track your virtual stock portfolio</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setFormErrors({}); setNewTicker(""); setNewShares(""); setNewPrice(""); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Stock to Portfolio</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Ticker Symbol</Label>
                <Input placeholder="e.g. AAPL, MSFT, GOOGL" value={newTicker} onChange={e => { setNewTicker(e.target.value); setFormErrors(prev => ({ ...prev, ticker: "" })); }} />
                {formErrors.ticker && <p className="text-xs text-destructive">{formErrors.ticker}</p>}
              </div>
              <div className="space-y-1">
                <Label>Number of Shares</Label>
                <Input type="number" placeholder="10" min="1" value={newShares} onChange={e => { setNewShares(e.target.value); setFormErrors(prev => ({ ...prev, shares: "" })); }} />
                {formErrors.shares && <p className="text-xs text-destructive">{formErrors.shares}</p>}
              </div>
              <div className="space-y-1">
                <Label>Buy Price (optional, defaults to current)</Label>
                <Input type="number" placeholder="150.00" min="0" step="0.01" value={newPrice} onChange={e => { setNewPrice(e.target.value); setFormErrors(prev => ({ ...prev, price: "" })); }} />
                {formErrors.price && <p className="text-xs text-destructive">{formErrors.price}</p>}
              </div>
              <Button onClick={addHolding} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {loading ? "Adding..." : "Add to Portfolio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Holdings</CardTitle></CardHeader>
          <CardContent>
            {holdings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No holdings yet. Click "Add Stock" to get started.</p>
            ) : (
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
                        <Button variant="ghost" size="icon" onClick={() => removeHolding(p.ticker)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;

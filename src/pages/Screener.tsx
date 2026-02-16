import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { stocks, getSectors } from "@/data/stocks";
import { Label } from "@/components/ui/label";

type SortKey = "ticker" | "price" | "changePercent" | "marketCap" | "volume" | "peRatio";

const Screener = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("ticker");
  const [sortAsc, setSortAsc] = useState(true);

  const sectors = getSectors();

  const filtered = useMemo(() => {
    let result = [...stocks];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (sector !== "all") result = result.filter(s => s.sector === sector);

    result.sort((a, b) => {
      let va: any = a[sortKey], vb: any = b[sortKey];
      if (sortKey === "marketCap") {
        const parse = (v: string) => { const n = parseFloat(v); return v.includes("T") ? n * 1000 : n; };
        va = parse(a.marketCap); vb = parse(b.marketCap);
      }
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
    return result;
  }, [search, sector, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Screener</h1>
        <p className="text-sm text-muted-foreground">Filter and sort stocks by various criteria</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Ticker or name..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Label className="text-xs">Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  { key: "ticker" as SortKey, label: "Ticker" },
                  { key: "price" as SortKey, label: "Price" },
                  { key: "changePercent" as SortKey, label: "Change" },
                  { key: "marketCap" as SortKey, label: "Market Cap" },
                  { key: "volume" as SortKey, label: "Volume" },
                  { key: "peRatio" as SortKey, label: "P/E" },
                ].map(col => (
                  <TableHead key={col.key}>
                    <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(col.key)}>
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                ))}
                <TableHead>Sector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.ticker} className="cursor-pointer" onClick={() => navigate(`/stock/${s.ticker}`)}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.ticker}</p>
                      <p className="text-xs text-muted-foreground">{s.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">${s.price.toFixed(2)}</TableCell>
                  <TableCell className={`font-mono font-medium ${s.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
                    {s.changePercent >= 0 ? "+" : ""}{s.changePercent}%
                  </TableCell>
                  <TableCell className="font-mono">{s.marketCap}</TableCell>
                  <TableCell className="font-mono">{(s.volume / 1e6).toFixed(1)}M</TableCell>
                  <TableCell className="font-mono">{s.peRatio.toFixed(1)}</TableCell>
                  <TableCell><span className="rounded-full bg-secondary px-2 py-1 text-xs">{s.sector}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Screener;

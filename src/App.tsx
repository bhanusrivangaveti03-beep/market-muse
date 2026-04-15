import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import StockDetail from "./pages/StockDetail";
import Portfolio from "./pages/Portfolio";
import Screener from "./pages/Screener";
import Analysis from "./pages/Analysis";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
            <Route path="/stock/:ticker" element={<ProtectedRoute><Layout><StockDetail /></Layout></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Layout><Portfolio /></Layout></ProtectedRoute>} />
            <Route path="/screener" element={<ProtectedRoute><Layout><Screener /></Layout></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Layout><Analysis /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

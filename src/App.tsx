
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Bids from "./pages/Bids";
import Projects from "./pages/Projects";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import BidDetails from "./pages/BidDetails";
import ProjectDetails from "./pages/ProjectDetails";
import Login from "./pages/Login";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Suppliers from "./pages/Suppliers";
import SupplierDetails from "./pages/SupplierDetails";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import { useState, useEffect } from "react";
import { User } from "./types";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            {user ? (
              <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
                <Route index element={<Dashboard />} />
                <Route path="bids" element={<Bids />} />
                <Route path="bids/:id" element={<BidDetails />} />
                <Route path="bids/new" element={<BidDetails />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="projects/new" element={<ProjectDetails />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetails />} />
                <Route path="clients/new" element={<ClientDetails />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="suppliers/:id" element={<SupplierDetails />} />
                <Route path="suppliers/new" element={<SupplierDetails />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="products/new" element={<ProductDetails />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            ) : (
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

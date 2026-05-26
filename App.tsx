import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthGate from "./components/auth/AuthGate";
import { useAuth } from "./hooks/useAuth";
import logoSrc from "@/assets/logo.png";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#00FF7F] blur-2xl opacity-50 animate-pulse" />
            <img
              src={logoSrc}
              alt="GaGa Chat"
              className="relative w-16 h-16 rounded-full ring-2 ring-[#00FF7F]/60 animate-pulse"
            />
          </div>
          <p className="text-white/50 text-sm">Loading GaGa Chat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthGate />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

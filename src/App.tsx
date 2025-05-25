import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import AdminCheck from "./components/admin/AdminCheck";

// Public Pages
import Index from "./pages/Index";
import ContentsPage from "./pages/ContentsPage";
import ContentPage from "./pages/ContentPage";
import FormPage from "./pages/FormPage";
import DeliveryPage from "./pages/DeliveryPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import InitialSetup from "./pages/admin/InitialSetup";
import Dashboard from "./pages/admin/Dashboard";
import ContentManagement from "./pages/admin/ContentManagement";
import Reports from "./pages/admin/Reports";
import SiteSettings from "./pages/admin/SiteSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="conteudos" element={<ContentsPage />} />
            <Route path="conteudo/:slug" element={<ContentPage />} />
            <Route path="form/:slug" element={<FormPage />} />
            <Route path="entrega/:slug" element={<DeliveryPage />} />
            <Route path="contato" element={<ContactPage />} />
            <Route path="termos" element={<TermsPage />} />
            <Route path="privacidade" element={<PrivacyPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminCheck />}>
            <Route path="setup" element={<InitialSetup />} />
            <Route path="login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="conteudos" element={<ContentManagement />} />
              <Route path="relatorios" element={<Reports />} />
              <Route path="configuracoes" element={<SiteSettings />} />
            </Route>
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

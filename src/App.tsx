import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import Reviews from "./pages/admin/Reviews";
import ForgotPassword from "./pages/admin/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="conteudos" element={<ContentsPage />} />
            <Route path="conteudo/:slug" element={<ContentPage />} />
            <Route path="formulario/:slug" element={<FormPage />} />
            <Route path="entrega/:slug" element={<DeliveryPage />} />
            <Route path="contato" element={<ContactPage />} />
            <Route path="termos" element={<TermsPage />} />
            <Route path="privacidade" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminCheck />}>
            <Route path="setup" element={<InitialSetup />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="contents" element={<ContentManagement />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SiteSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

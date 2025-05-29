import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, FileText, BarChart, Menu, LogOut, FileEdit, Settings, MessageSquare } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import DynamicHead from "@/components/DynamicHead";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';
  const siteName = settings?.siteName || 'Conteúdo Premium';

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Em produção, verificaria a validade do token com o backend
    setIsAuthenticated(true);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, title: "Dashboard", path: "/admin/dashboard" },
    { icon: FileEdit, title: "Conteúdos", path: "/admin/conteudos" },
    { icon: BarChart, title: "Relatórios", path: "/admin/relatorios" },
    { icon: MessageSquare, title: "Avaliações", path: "/admin/avaliacoes" },
    { icon: Settings, title: "Configurações", path: "/admin/configuracoes" }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <DynamicHead />
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-4 border-b">
          <Link 
            to="/admin/dashboard" 
            className="font-display font-semibold text-lg block"
            style={{ color: primaryColor }}
          >
            {siteName}
          </Link>
          <p className="text-xs text-gray-500">Painel Administrativo</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200"
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0">
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="py-4">
                  <div className="mb-4 px-2">
                    <h2 
                      className="font-display font-semibold text-lg"
                      style={{ color: primaryColor }}
                    >
                      {siteName}
                    </h2>
                    <p className="text-xs text-gray-500">Painel Administrativo</p>
                  </div>
                  <nav>
                    <ul className="space-y-1">
                      {menuItems.map((item) => (
                        <li key={item.path}>
                          <Link 
                            to={item.path} 
                            className="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200"
                            style={{ color: 'inherit' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1 md:hidden px-4">
            <h1 
              className="text-base sm:text-lg font-medium truncate"
              style={{ color: primaryColor }}
            >
              {siteName}
            </h1>
          </div>

          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-xs sm:text-sm transition-colors duration-200"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
              onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

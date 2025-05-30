import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, loading } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';

  return (
    <header className="border-b py-4 bg-white">
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span 
            className="font-display font-semibold text-xl"
            style={{ color: primaryColor }}
          >
            {loading ? "Carregando..." : settings?.siteName || "Conteúdo Premium"}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium transition-colors"
            style={{ color: '#4B5563' }}
            onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
            onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
          >
            Home
          </Link>
          <Link 
            to="/conteudos" 
            className="text-sm font-medium transition-colors"
            style={{ color: '#4B5563' }}
            onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
            onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
          >
            Conteúdos
          </Link>
          <Link 
            to="/contato" 
            className="text-sm font-medium transition-colors"
            style={{ color: '#4B5563' }}
            onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
            onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
          >
            Contato
          </Link>
          <Link to="/admin/login">
            <Button variant="outline" size="sm">
              Login Admin
            </Button>
          </Link>
        </nav>

        <div className="block md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="py-4">
                <div className="mb-6">
                  <h2 
                    className="font-display font-semibold text-lg"
                    style={{ color: primaryColor }}
                  >
                    {loading ? "Carregando..." : settings?.siteName || "Conteúdo Premium"}
                  </h2>
                </div>
                <nav className="space-y-4">
                  <Link 
                    to="/" 
                    className="block text-sm font-medium transition-colors py-2"
                    style={{ color: '#4B5563' }}
                    onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/conteudos" 
                    className="block text-sm font-medium transition-colors py-2"
                    style={{ color: '#4B5563' }}
                    onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Conteúdos
                  </Link>
                  <Link 
                    to="/contato" 
                    className="block text-sm font-medium transition-colors py-2"
                    style={{ color: '#4B5563' }}
                    onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
                    onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contato
                  </Link>
                  <Link 
                    to="/admin/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Login Admin
                    </Button>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

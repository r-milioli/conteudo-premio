import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import DOMPurify from 'dompurify';

export default function Footer() {
  const { settings, loading } = useSiteSettings();
  const hoverColor = settings?.primaryColor || '#4361ee';
  const currentYear = new Date().getFullYear();

  const getSafeHtml = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const defaultFooterText = `© ${currentYear} Conteúdo Premium. Todos os direitos reservados.`;

  return (
    <footer className="bg-gray-50 border-t py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <Link 
              to="/" 
              className="font-display font-semibold text-xl"
              style={{ color: settings?.primaryColor || '#4361ee' }}
            >
              {loading ? "Carregando..." : settings?.siteName || "Conteúdo Premium"}
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Plataforma para criadores de conteúdo distribuírem seus materiais digitais com contribuição opcional.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-medium text-sm">Links Rápidos</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="text-sm text-gray-600 transition-colors"
                    onMouseOver={(e) => e.currentTarget.style.color = hoverColor}
                    onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contato" 
                    className="text-sm text-gray-600 transition-colors"
                    onMouseOver={(e) => e.currentTarget.style.color = hoverColor}
                    onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                  >
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link 
                    to="/termos" 
                    className="text-sm text-gray-600 transition-colors"
                    onMouseOver={(e) => e.currentTarget.style.color = hoverColor}
                    onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacidade" 
                    className="text-sm text-gray-600 transition-colors"
                    onMouseOver={(e) => e.currentTarget.style.color = hoverColor}
                    onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                  >
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8">
          {loading ? (
            <p className="text-sm text-gray-500 text-center">Carregando...</p>
          ) : (
            <div 
              className="text-sm text-gray-500 text-center"
              dangerouslySetInnerHTML={getSafeHtml(settings?.footerText || defaultFooterText)}
            />
          )}
        </div>
      </div>
    </footer>
  );
}


import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <Link to="/" className="font-display font-semibold text-xl text-brand-blue">
              Conteúdo Premium
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
                  <Link to="/" className="text-sm text-gray-600 hover:text-brand-blue">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="text-sm text-gray-600 hover:text-brand-blue">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-sm">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/termos" className="text-sm text-gray-600 hover:text-brand-blue">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacidade" className="text-sm text-gray-600 hover:text-brand-blue">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-6">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Conteúdo Premium. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

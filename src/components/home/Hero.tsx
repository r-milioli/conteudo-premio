import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

export default function Hero() {
  const { settings, loading } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';
  
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `linear-gradient(to bottom right, ${settings?.heroGradientFrom || '#dbeafe'}, ${settings?.heroGradientVia || '#faf5ff'}, ${settings?.heroGradientTo || '#e0e7ff'})`
        }}
      ></div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6 animate-fade-in">
            Materiais exclusivos para quem quer ir além
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in animate-delay-100">
            Acesse conteúdos premium de alta qualidade para criadores de conteúdo,
            com contribuição opcional.
          </p>
          <div className="animate-fade-in animate-delay-200">
            <Button 
              asChild 
              size="lg" 
              className="text-white transition-colors duration-200"
              style={{ 
                backgroundColor: primaryColor,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            >
              <Link to="/conteudos">Explorar Conteúdos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

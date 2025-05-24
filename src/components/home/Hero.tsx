
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 opacity-60"></div>
      
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
            <Button asChild size="lg" className="gradient-bg">
              <Link to="/conteudos">Explorar Conteúdos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

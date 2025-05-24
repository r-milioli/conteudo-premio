
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Simulando dados de conteúdo em destaque
const featuredContents = [
  {
    id: 1,
    title: "Como Gravar Vídeos Profissionais",
    description: "Aprenda técnicas profissionais para gravar vídeos de alta qualidade com equipamentos acessíveis.",
    slug: "como-gravar-videos-profissionais",
    image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Edição de Vídeo para Iniciantes",
    description: "Domine as técnicas fundamentais de edição de vídeo e crie conteúdo cativante para suas redes.",
    slug: "edicao-video-iniciantes",
    image: "https://images.unsplash.com/photo-1574717024379-61ea99a4d334?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Como Criar Thumbnails Atraentes",
    description: "Aumente seus cliques com thumbnails que realmente convertem. Templates e técnicas exclusivas.",
    slug: "como-criar-thumbnails",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2671&auto=format&fit=crop",
  }
];

export default function FeaturedContent() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Conteúdos em Destaque</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Materiais exclusivos criados para ajudar você a se destacar na produção de conteúdo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredContents.map((content, index) => (
            <Card key={content.id} className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={content.image} 
                  alt={content.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle>{content.title}</CardTitle>
                <CardDescription>{content.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/conteudo/${content.slug}`}>Acessar Conteúdo</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

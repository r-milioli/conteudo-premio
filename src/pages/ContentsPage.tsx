
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dados simulados dos conteúdos
const allContents = [
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
  },
  {
    id: 4,
    title: "Estratégias de Marketing Digital",
    description: "As melhores estratégias para bombar seu negócio online e aumentar suas vendas.",
    slug: "estrategias-marketing-digital",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Como Criar um Podcast de Sucesso",
    description: "Dicas e truques para criar um podcast que realmente engaja sua audiência.",
    slug: "como-criar-podcast-sucesso",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Fotografia para Redes Sociais",
    description: "Aprenda a fotografar como um profissional para suas redes sociais e conteúdo digital.",
    slug: "fotografia-redes-sociais",
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?q=80&w=2608&auto=format&fit=crop",
  }
];

const ContentsPage = () => {
  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Todos os Conteúdos</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore nossa coleção completa de materiais exclusivos criados para ajudar você a se destacar na produção de conteúdo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allContents.map((content, index) => (
            <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={content.image} 
                  alt={content.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{content.title}</CardTitle>
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
    </div>
  );
};

export default ContentsPage;

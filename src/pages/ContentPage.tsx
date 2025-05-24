
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

// Dados simulados - seriam obtidos da API/banco de dados
const contentData = [
  {
    id: 1,
    title: "Como Gravar Vídeos Profissionais",
    description: "Aprenda técnicas profissionais para gravar vídeos de alta qualidade com equipamentos acessíveis. Este guia contém técnicas avançadas de iluminação, captação de áudio e composição de cena.",
    slug: "como-gravar-videos-profissionais",
    image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=2670&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 2,
    title: "Edição de Vídeo para Iniciantes",
    description: "Domine as técnicas fundamentais de edição de vídeo e crie conteúdo cativante para suas redes. Aprenda sobre cortes, transições, correção de cor e muito mais.",
    slug: "edicao-video-iniciantes",
    image: "https://images.unsplash.com/photo-1574717024379-61ea99a4d334?q=80&w=2670&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 3,
    title: "Como Criar Thumbnails Atraentes",
    description: "Aumente seus cliques com thumbnails que realmente convertem. Templates e técnicas exclusivas para criar thumbnails profissionais que aumentam sua taxa de cliques.",
    slug: "como-criar-thumbnails",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2671&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

const ContentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando uma chamada API para buscar dados do conteúdo
    setLoading(true);
    setTimeout(() => {
      const foundContent = contentData.find(item => item.slug === slug);
      setContent(foundContent);
      setLoading(false);
    }, 500);
  }, [slug]);

  const handleAccessContent = () => {
    // Fixed navigation - now correctly using the current content slug
    navigate(`/form/${slug}`);
  };

  if (loading) {
    return (
      <div className="py-16 container-custom">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="py-16 container-custom">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Conteúdo não encontrado</CardTitle>
            <CardDescription>O conteúdo que você procura não existe ou foi removido.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")}>Voltar para a página inicial</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="py-16 container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img 
              src={content.image} 
              alt={content.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{content.description}</p>

          <div className="bg-gray-50 p-8 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">O que você vai receber</h2>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                <span>Material digital completo em formato PDF</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                <span>Vídeos explicativos com técnicas profissionais</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                <span>Templates exclusivos para acelerar seu trabalho</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                <span>Acesso vitalício a todas as atualizações futuras</span>
              </li>
            </ul>

            <Button onClick={handleAccessContent} size="lg" className="w-full sm:w-auto gradient-bg">
              Acessar este conteúdo
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentPage;

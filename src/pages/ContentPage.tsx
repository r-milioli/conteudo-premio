import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

const ContentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/contents/${slug}`);
        
        if (!response.ok) {
          throw new Error('Conteúdo não encontrado');
        }

        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  const handleAccessContent = () => {
    navigate(`/formulario/${slug}`);
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
              src={content.banner_image_url || content.thumbnail_url} 
              alt={content.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{content.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{content.description}</p>

          <h2 className="text-2xl font-semibold mb-4">O que você vai receber</h2>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
              <span>Material digital completo em formato PDF</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
              <span>Vídeos explicativos com técnicas profissionais</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
              <span>Templates exclusivos para acelerar seu trabalho</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-6 w-6 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
              <span>Acesso vitalício a todas as atualizações futuras</span>
            </li>
          </ul>

          <Button 
            onClick={handleAccessContent} 
            size="lg" 
            className={cn(
              "w-full sm:w-auto transition-colors",
              "hover:opacity-90"
            )}
            style={{ 
              backgroundColor: primaryColor,
              color: 'white'
            }}
          >
            Acessar este conteúdo
          </Button>
        </div>
      </div>
    </>
  );
};

export default ContentPage;

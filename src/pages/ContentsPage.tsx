import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { User, Download } from "lucide-react";

interface Content {
  id: number;
  title: string;
  description: string;
  slug: string;
  thumbnail_url: string;
  banner_image_url: string;
  access_count: number;
  download_count: number;
}

const ContentsPage = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/contents');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar conteúdos');
        }

        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        setContents(data);
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  if (loading) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="container-custom">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
          </div>
        </div>
      </div>
    );
  }

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
          {contents.map((content, index) => (
            <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={content.thumbnail_url || content.banner_image_url} 
                  alt={content.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{content.title}</CardTitle>
                <CardDescription>{content.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {content.access_count ?? 0} acessos
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {content.download_count ?? 0} downloads
                  </div>
                </div>
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

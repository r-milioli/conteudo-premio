import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { User, Download, Link as LinkIcon } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Content {
  id: number;
  title: string;
  description: string;
  slug: string;
  thumbnail_url: string | null | undefined;
  banner_image_url: string | null | undefined;
  access_count: number;
  download_count: number;
}

const ContentsPage = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/contents?page=${currentPage}&search=${searchTerm}`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar conteúdos');
        }

        const data = await response.json();
        setContents(data.contents);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce para a pesquisa
    const timeoutId = setTimeout(() => {
      fetchContents();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset para a primeira página ao pesquisar
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
            Explore nossa coleção completa de materiais exclusivos criados para ajudar você a se destacar na produção de conteúdo
          </p>

          {/* Barra de pesquisa */}
          <div className="max-w-md mx-auto mb-8">
            <Input
              type="text"
              placeholder="Pesquisar conteúdos..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum conteúdo encontrado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content, index) => (
                <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={content.thumbnail_url || content.banner_image_url || '/placeholder.svg'} 
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
                    <Button 
                      asChild 
                      className={cn(
                        "w-full transition-colors",
                        "hover:opacity-90"
                      )}
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white'
                      }}
                    >
                      <Link to={`/conteudo/${content.slug}`}>Acessar Conteúdo</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    style={currentPage === page ? { 
                      backgroundColor: primaryColor,
                      color: 'white'
                    } : {}}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentsPage;

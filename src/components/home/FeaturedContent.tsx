import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Content {
  id: number;
  title: string;
  description: string;
  slug: string;
  thumbnail_url: string;
  banner_image_url: string;
}

export default function FeaturedContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await fetch('/api/public/contents');
        if (!response.ok) {
          throw new Error('Erro ao carregar conteúdos');
        }
        const data = await response.json();
        // Embaralha os conteúdos e pega 3 aleatórios
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        setContents(selected);
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
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Conteúdos em Destaque</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Materiais exclusivos criados para ajudar você a se destacar na produção de conteúdo
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Conteúdos em Destaque</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Materiais exclusivos criados para ajudar você a se destacar na produção de conteúdo
          </p>
        </div>

        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true
            }}
            className="w-full"
          >
            <CarouselContent>
              {contents.map((content, index) => (
                <CarouselItem key={content.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={content.thumbnail_url || content.banner_image_url} 
                        alt={content.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{content.title}</CardTitle>
                      <CardDescription>{content.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        asChild 
                        className="w-full text-white transition-colors duration-200"
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
                        <Link to={`/conteudo/${content.slug}`}>Acessar Conteúdo</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              className="text-white transition-colors duration-200"
              style={{ 
                backgroundColor: primaryColor,
                borderColor: primaryColor
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            />
            <CarouselNext 
              className="text-white transition-colors duration-200"
              style={{ 
                backgroundColor: primaryColor,
                borderColor: primaryColor
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
              }}
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

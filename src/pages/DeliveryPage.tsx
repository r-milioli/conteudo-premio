import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Check } from "lucide-react";
import { useMercadoPago } from "@/hooks/useMercadoPago";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

const DeliveryPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';
  
  // Get user data from location state
  const userData = location.state || {};

  const mp = useMercadoPago();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/contents/${slug}/delivery`);
        
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
    
    // Se não houver dados de estado, redireciona para o formulário
    if (!location.state) {
      navigate(`/form/${slug}`);
      return;
    }
  }, [slug, location.state, navigate]);

  // Handle download click
  const handleDownload = async () => {
    try {
      // Registra o download
      const response = await fetch(`/api/public/contents/${slug}/download`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar download');
      }

      setShowThankYou(true);
      window.open(content.downloadLink, "_blank");
    } catch (error) {
      console.error('Erro ao registrar download:', error);
      // Ainda abre o download mesmo se falhar o registro
      setShowThankYou(true);
      window.open(content.downloadLink, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Conteúdo não encontrado</h1>
        <p>O conteúdo solicitado não está disponível.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Voltar para a página inicial
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      {/* User info and payment status banner */}
      {userData.email && (
        <div className="mb-6 p-4 rounded-lg flex items-center justify-between" style={{
          backgroundColor: `${primaryColor}10`,
          borderColor: `${primaryColor}30`,
          borderWidth: '1px'
        }}>
          <div>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {userData.email}
            </p>
            <p className="text-sm">
              <span className="font-medium">Contribuição:</span>{" "}
              {userData.contribuicao > 0
                ? `R$ ${userData.contribuicao.toFixed(2)}`
                : "Acesso gratuito"}
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{
            backgroundColor: `${primaryColor}20`,
            color: primaryColor
          }}>
            <Check className="w-3 h-3 mr-1" />
            {userData.contribuicao > 0 ? "Pagamento aprovado" : "Acesso liberado"}
          </span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {content.deliveryPageTitle || "Seu acesso foi liberado!"}
          </h1>
          <p className="text-gray-600 text-lg">
            {content.deliveryPageDescription || "Parabéns! Você já pode acessar o conteúdo completo."}
          </p>
        </div>

        {/* Video player */}
        {content.deliveryPageVideoUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-12">
            <iframe 
              width="100%" 
              height="100%" 
              src={content.deliveryPageVideoUrl} 
              title="Delivery video"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}

        {/* Custom HTML content */}
        {content.deliveryPageHtml && (
          <div 
            className="prose max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: content.deliveryPageHtml }} 
          />
        )}

        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          {showThankYou ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <Check className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg font-medium mb-2">Obrigado pelo download!</h3>
              <p className="text-gray-600">
                Seu download foi iniciado. Se não começou automaticamente,{" "}
                <a 
                  href={content.downloadLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: primaryColor }}
                >
                  clique aqui
                </a>.
              </p>
            </div>
          ) : (
            <Button 
              size="lg" 
              onClick={handleDownload} 
              className={cn(
                "w-full sm:w-auto transition-colors",
                "hover:opacity-90"
              )}
              style={{ 
                backgroundColor: primaryColor,
                color: 'white'
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar Material Completo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;

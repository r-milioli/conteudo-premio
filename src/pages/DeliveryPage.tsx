import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Check } from "lucide-react";
import { useMercadoPago } from "@/hooks/useMercadoPago";

const DeliveryPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          userData.contribuicao > 0 
            ? "bg-green-50 border border-green-200" 
            : "bg-blue-50 border border-blue-200"
        }`}>
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
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            userData.contribuicao > 0
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}>
            <Check className="w-3 h-3 mr-1" />
            {userData.contribuicao > 0 ? "Pagamento aprovado" : "Acesso liberado"}
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {content.videoUrl && (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={content.videoUrl}
              title={content.titulo}
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">{content.titulo}</h1>

          {/* Custom content from admin panel */}
          {content.deliveryHtml && (
            <div 
              className="prose max-w-none mb-8" 
              dangerouslySetInnerHTML={{ __html: content.deliveryHtml }}
            />
          )}

          {/* Download section */}
          {content.downloadLink && (
            <div className="my-8 bg-gray-50 border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Material para Download</h2>
              
              {showThankYou ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Obrigado pelo download!</h3>
                  <p className="text-gray-600">
                    Seu download foi iniciado. Se não começou automaticamente,{" "}
                    <a 
                      href={content.downloadLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      clique aqui
                    </a>.
                  </p>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  onClick={handleDownload} 
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Material Completo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;

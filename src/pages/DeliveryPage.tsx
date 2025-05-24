import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Check } from "lucide-react";
import { useMercadoPago } from "@/hooks/useMercadoPago";

// Mock content data
const mockContents = [
  {
    id: 1,
    titulo: "Como Gravar Vídeos Profissionais",
    slug: "como-gravar-videos-profissionais",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    texto_html: `
      <h2>Guia para Gravação de Vídeos Profissionais</h2>
      <p>Neste guia completo, você aprenderá técnicas profissionais para elevar a qualidade dos seus vídeos.</p>
      <h3>Iluminação</h3>
      <p>A iluminação é fundamental para produzir vídeos de qualidade. Sempre busque gravar com luz natural ou invista em um kit básico de iluminação de 3 pontos.</p>
      <h3>Áudio</h3>
      <p>O áudio é tão importante quanto a imagem. Invista em um bom microfone lapela ou direcional para garantir que sua voz esteja clara e sem ruídos.</p>
      <h3>Composição</h3>
      <p>Preste atenção ao enquadramento do seu vídeo. Utilize a regra dos terços e mantenha um fundo limpo e profissional.</p>
    `,
    link_download: "https://example.com/downloads/video-guide.pdf",
    links_adicionais: [
      { titulo: "Entre no nosso Grupo do Telegram", url: "https://t.me/example" },
      { titulo: "Acesse materiais extras", url: "https://example.com/extras" }
    ],
    pagina_entrega_html: `
      <h2>Parabéns pelo acesso!</h2>
      <p>Você agora tem acesso ao nosso guia completo de gravação de vídeos profissionais.</p>
      <p>Aqui estão alguns recursos extras para complementar seu aprendizado:</p>
      <ul>
        <li>Checklist para gravação de vídeos</li>
        <li>Lista de equipamentos recomendados</li>
        <li>Dicas para edição rápida</li>
      </ul>
    `
  },
  {
    id: 2,
    titulo: "Edição de Vídeo para Iniciantes",
    slug: "edicao-video-iniciantes",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    texto_html: `
      <h2>Começando com Edição de Vídeo</h2>
      <p>Este guia vai te ajudar a dar os primeiros passos na edição de vídeos usando ferramentas acessíveis.</p>
      <h3>Escolhendo o Software</h3>
      <p>Para iniciantes, recomendamos começar com o DaVinci Resolve (gratuito) ou o Adobe Premiere (pago).</p>
      <h3>Cortes básicos</h3>
      <p>Aprenda a fazer cortes precisos, transições suaves e a sincronizar áudio com vídeo.</p>
      <h3>Exportação</h3>
      <p>Configure corretamente os parâmetros de exportação para garantir qualidade sem arquivos muito pesados.</p>
    `,
    link_download: "https://example.com/downloads/edit-guide.pdf",
    links_adicionais: [
      { titulo: "Baixe Presets Gratuitos", url: "https://example.com/presets" },
      { titulo: "Tutorial em Vídeo", url: "https://youtube.com/example" }
    ],
    pagina_entrega_html: `
      <h2>Bem-vindo ao Guia de Edição de Vídeo!</h2>
      <p>Este material foi criado para ajudar iniciantes a dominarem as técnicas essenciais de edição.</p>
      <p>Não esqueça de praticar regularmente e experimentar novas técnicas!</p>
    `
  },
  {
    id: 3,
    titulo: "Como Criar Thumbnails Atraentes",
    slug: "como-criar-thumbnails",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    texto_html: `
      <h2>A Arte de Criar Thumbnails</h2>
      <p>Thumbnails atraentes aumentam significativamente a taxa de cliques nos seus vídeos.</p>
      <h3>Elementos principais</h3>
      <p>Uma boa thumbnail deve ter: texto conciso, imagem de alto contraste e elementos que despertem curiosidade.</p>
      <h3>Ferramentas</h3>
      <p>Você pode criar thumbnails usando Photoshop, Canva ou mesmo o GIMP (gratuito).</p>
      <h3>Testes A/B</h3>
      <p>Experimente diferentes estilos de thumbnails e analise qual gera mais cliques para seu canal.</p>
    `,
    link_download: "https://example.com/downloads/thumbnail-templates.zip",
    links_adicionais: [
      { titulo: "100 Templates Gratuitos", url: "https://example.com/templates" },
      { titulo: "Paletas de Cores Recomendadas", url: "https://example.com/palettes" }
    ],
    pagina_entrega_html: `
      <h2>Templates de Thumbnails Prontos para Uso!</h2>
      <p>Estes templates foram criados para ajudar você a destacar seus vídeos na busca do YouTube.</p>
      <p>Basta editar no Photoshop ou Canva e personalizar com suas próprias imagens e textos.</p>
      <h3>Como usar:</h3>
      <ol>
        <li>Baixe o arquivo ZIP</li>
        <li>Extraia os arquivos</li>
        <li>Abra no seu editor preferido</li>
        <li>Personalize e exporte</li>
      </ol>
    `
  }
];

const DeliveryPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user data from location state
  const userData = location.state || {};

  const mp = useMercadoPago('YOUR_PUBLIC_KEY');

  useEffect(() => {
    // Find the content by slug
    const foundContent = mockContents.find(c => c.slug === slug);
    
    if (foundContent) {
      setContent(foundContent);
    }
    
    // Se não houver dados de estado E não houver conteúdo, redireciona para a página inicial
    if (!location.state && !foundContent) {
      navigate("/");
      return;
    }
    
    // Se houver conteúdo mas não houver dados de estado, redireciona para o formulário
    if (!location.state && foundContent) {
      navigate(`/form/${slug}`);
      return;
    }
  }, [slug, location.state, navigate]);

  // Handle download click
  const handleDownload = () => {
    setShowThankYou(true);
    window.open(content.link_download, "_blank");
  };

  const processPayment = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/entrega/${slug}`, { 
        state: { 
          email: userData.email,
          contribuicao: userData.contribuicao,
          status: "aprovado"
        } 
      });
    }, 2000);
  };

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
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={content.video_url}
            title={content.titulo}
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">{content.titulo}</h1>

          {/* Custom content from admin panel */}
          {content.pagina_entrega_html && (
            <div 
              className="prose max-w-none mb-8" 
              dangerouslySetInnerHTML={{ __html: content.pagina_entrega_html }}
            />
          )}

          {/* Download section */}
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
                    href={content.link_download} 
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

          {/* Additional links */}
          {content.links_adicionais && content.links_adicionais.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Links Adicionais</h2>
              <div className="space-y-3">
                {content.links_adicionais.map((link: any, index: number) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {link.titulo}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;

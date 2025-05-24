import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useMercadoPago } from "@/hooks/useMercadoPago";

// Mock content data - this would be fetched from an API in a real app
const mockContents = [
  {
    id: 1,
    titulo: "Como Gravar Vídeos Profissionais",
    slug: "como-gravar-videos-profissionais",
    descricao: "Aprenda técnicas profissionais para gravação de vídeos.",
    thumbnail: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=2670&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    formHtml: "<h3>Este material vai transformar seus vídeos</h3><p>Tenha acesso a técnicas profissionais usadas em estúdios de gravação de alto padrão.</p>"
  },
  {
    id: 2,
    titulo: "Edição de Vídeo para Iniciantes",
    slug: "edicao-video-iniciantes",
    descricao: "Guia completo de edição de vídeos para quem está começando.",
    thumbnail: "https://images.unsplash.com/photo-1574717024379-61ea99a4d334?q=80&w=2670&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    formHtml: "<h3>Edite como um profissional</h3><p>Este guia completo vai te ensinar todas as técnicas essenciais para edições de nível profissional.</p>"
  },
  {
    id: 3,
    titulo: "Como Criar Thumbnails Atraentes",
    slug: "como-criar-thumbnails",
    descricao: "Aprenda a criar thumbnails que atraem cliques para seus vídeos.",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2671&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    formHtml: "<h3>Multiplique seus cliques</h3><p>Aprenda a criar thumbnails irresistíveis que vão aumentar drasticamente sua taxa de cliques.</p>"
  },
];

// Form schema for initial form
const initialFormSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido",
  }),
  contribuicao: z.string().refine((val) => {
    const num = parseFloat(val.replace(",", "."));
    return !isNaN(num) && num >= 0;
  }, {
    message: "Por favor, insira um valor válido (igual ou maior que zero)",
  }),
});

// Form schema for checkout
const checkoutFormSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido"),
  cardExpiry: z.string().min(5, "Data de validade inválida"),
  cardCvv: z.string().min(3, "CVV inválido"),
  cardName: z.string().min(3, "Nome inválido"),
  cpf: z.string().min(11, "CPF inválido"),
});

const FormPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();
  const mp = useMercadoPago('TEST-YOUR-PUBLIC-KEY'); // Substitua pela sua chave pública do Mercado Pago

  // Get content based on slug
  const content = mockContents.find((c) => c.slug === slug);

  const initialForm = useForm<z.infer<typeof initialFormSchema>>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: {
      email: "",
      contribuicao: "0",
    },
  });

  const checkoutForm = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardName: "",
      cpf: "",
    },
  });

  const onInitialSubmit = async (values: z.infer<typeof initialFormSchema>) => {
    const contribuicao = parseFloat(values.contribuicao.replace(",", "."));
    
    if (contribuicao > 0) {
      setShowCheckout(true);
    } else {
      setIsSubmitting(true);
      
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/entrega/${slug}`, { 
          state: { 
            email: values.email,
            contribuicao: 0,
            status: "gratuito"
          } 
        });
      }, 1500);
    }
  };

  const onCheckoutSubmit = async (values: z.infer<typeof checkoutFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Criar um objeto de pagamento para o Mercado Pago
      const paymentData = {
        transaction_amount: parseFloat(initialForm.getValues("contribuicao").replace(",", ".")),
        description: `Contribuição para ${content?.titulo}`,
        payment_method_id: 'credit_card',
        payer: {
          email: initialForm.getValues("email"),
        },
        card: {
          number: values.cardNumber.replace(/\s/g, ''),
          expiration_month: values.cardExpiry.split('/')[0],
          expiration_year: '20' + values.cardExpiry.split('/')[1],
          security_code: values.cardCvv,
          cardholder: {
            name: values.cardName,
            identification: {
              type: 'CPF',
              number: values.cpf.replace(/\D/g, '')
            }
          }
        }
      };

      // Processar o pagamento usando o SDK do Mercado Pago
      const response = await mp.createPayment(paymentData);
      
      if (response.status === "approved") {
        navigate(`/entrega/${slug}`, { 
          state: { 
            email: initialForm.getValues("email"),
            contribuicao: parseFloat(initialForm.getValues("contribuicao").replace(",", ".")),
            status: "aprovado",
            payment_id: response.id
          } 
        });
        
        toast({
          title: "Pagamento aprovado!",
          description: "Seu acesso ao conteúdo foi liberado.",
        });
      } else {
        throw new Error('Pagamento não aprovado');
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: "Houve um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!content) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Conteúdo não encontrado</h1>
        <p>O conteúdo solicitado não está disponível.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Content presentation */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-2">{content.titulo}</h1>
            <p className="text-gray-600 mb-4">{content.descricao}</p>
            
            {/* Featured image */}
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
              <img 
                src={content.thumbnail} 
                alt={content.titulo} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Video player */}
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe 
                width="100%" 
                height="100%" 
                src={content.videoUrl} 
                title="Video preview"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            {/* Custom HTML content */}
            <div 
              className="prose max-w-none mt-6"
              dangerouslySetInnerHTML={{ __html: content.formHtml }} 
            />
          </div>

          {/* Right column - Form and checkout */}
          <div>
            {!showCheckout ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Complete para acessar o conteúdo
                </h2>
                <Form {...initialForm}>
                  <form onSubmit={initialForm.handleSubmit(onInitialSubmit)} className="space-y-4">
                    <FormField
                      control={initialForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={initialForm.control}
                      name="contribuicao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contribuição (R$)</FormLabel>
                          <FormControl>
                            <Input placeholder="0,00" {...field} />
                          </FormControl>
                          <p className="text-sm text-gray-500 mt-1">
                            Você pode contribuir com qualquer valor ou deixar 0 para acesso gratuito.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Continuar"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Finalizar contribuição</h2>
                
                <div className="border rounded-md p-4 mb-6 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <span>Conteúdo:</span>
                    <span className="font-medium">{content.titulo}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Email:</span>
                    <span className="font-medium">{initialForm.getValues("email")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contribuição:</span>
                    <span className="font-medium">
                      R$ {parseFloat(initialForm.getValues("contribuicao").replace(",", ".")).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Transparent checkout form - Mercado Pago */}
                <Form {...checkoutForm}>
                  <form onSubmit={checkoutForm.handleSubmit(onCheckoutSubmit)} className="space-y-4">
                    <FormField
                      control={checkoutForm.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Cartão</FormLabel>
                          <FormControl>
                            <Input placeholder="1234 5678 9012 3456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={checkoutForm.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validade</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/AA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={checkoutForm.control}
                        name="cardCvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={checkoutForm.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome no Cartão</FormLabel>
                          <FormControl>
                            <Input placeholder="NOME COMPLETO" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={checkoutForm.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="123.456.789-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando pagamento...
                          </>
                        ) : (
                          "Pagar e Acessar Conteúdo"
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="ghost" 
                        className="w-full mt-2" 
                        onClick={() => setShowCheckout(false)}
                        disabled={isSubmitting}
                      >
                        Voltar
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>Pagamento processado com segurança via Mercado Pago</p>
                  <p className="mt-1">Seus dados estão protegidos com criptografia de ponta a ponta</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;

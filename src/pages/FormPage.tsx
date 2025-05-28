import { useState, useEffect } from "react";
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
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

// Form schema for initial form
const initialFormSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido",
  }),
  contribuicao: z.string().refine((val) => {
    const num = parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.'));
    return !isNaN(num) && num >= 0;
  }, {
    message: "Por favor, insira um valor válido (igual ou maior que zero)",
  }),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  cardName: z.string().optional(),
  cpf: z.string().optional(),
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
  const [showCardFields, setShowCardFields] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();
  const mp = useMercadoPago();
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/contents/${slug}/form`);
        
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

  const initialForm = useForm<z.infer<typeof initialFormSchema>>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: {
      email: "",
      contribuicao: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardName: "",
      cpf: "",
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

  useEffect(() => {
    // Reseta o formulário de checkout quando showCheckout muda para true
    if (showCardFields) {
      checkoutForm.reset({
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        cardName: "",
        cpf: "",
      });
    }
  }, [showCardFields]);

  // Monitora mudanças no valor da contribuição
  useEffect(() => {
    const subscription = initialForm.watch((value, { name }) => {
      if (name === 'contribuicao') {
        const contribuicao = parseFloat(value.contribuicao?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
        setShowCardFields(contribuicao > 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [initialForm.watch]);

  const onInitialSubmit = async (values: z.infer<typeof initialFormSchema>) => {
    const contribuicao = parseFloat(values.contribuicao.replace(/[^\d,]/g, '').replace(',', '.'));
    
    try {
      // Se for acesso gratuito, registra imediatamente
      if (contribuicao === 0) {
        // Registra o acesso
        const response = await fetch(`/api/public/contents/${slug}/access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            contribution_amount: 0,
            payment_status: 'gratuito'
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao registrar acesso');
        }

        navigate(`/entrega/${slug}`, { 
          state: { 
            email: values.email,
            contribuicao: 0,
            status: "gratuito"
          } 
        });
      } else {
        setIsSubmitting(true);
        // Processar pagamento com todos os dados do cartão
        try {
          const paymentData = {
            transaction_amount: contribuicao,
            description: `Contribuição para ${content?.titulo}`,
            payment_method_id: 'credit_card',
            payer: {
              email: values.email,
            },
            card: {
              number: values.cardNumber?.replace(/\D/g, '') || '',
              expiration_month: values.cardExpiry?.split('/')[0] || '',
              expiration_year: '20' + (values.cardExpiry?.split('/')[1] || ''),
              security_code: values.cardCvv,
              cardholder: {
                name: values.cardName,
                identification: {
                  type: 'CPF',
                  number: values.cpf?.replace(/\D/g, '') || ''
                }
              }
            }
          };

          const response = await mp.createPayment(paymentData);
          
          if (response.status === "approved") {
            // Registra o acesso somente após a aprovação do pagamento
            const accessResponse = await fetch(`/api/public/contents/${slug}/access`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: values.email,
                contribution_amount: contribuicao,
                payment_id: response.id,
                payment_status: response.status
              }),
            });

            if (!accessResponse.ok) {
              throw new Error('Erro ao registrar acesso após pagamento');
            }

            navigate(`/entrega/${slug}`, { 
              state: { 
                email: values.email,
                contribuicao: contribuicao,
                status: "aprovado",
                payment_id: response.id
              } 
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
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Erro ao processar operação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a operação. Tente novamente.",
        variant: "destructive",
      });
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
        // Atualiza o registro de acesso com as informações do pagamento
        await fetch(`/api/public/contents/${slug}/access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: initialForm.getValues("email"),
            contribution_amount: parseFloat(initialForm.getValues("contribuicao").replace(",", ".")),
            payment_id: response.id,
            payment_status: response.status
          }),
        });

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

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Conteúdo não encontrado</h1>
        <p>O conteúdo solicitado não está disponível.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Voltar para a página inicial
        </Button>
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
            {content.videoUrl && (
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
            )}
            
            {/* Custom HTML content */}
            {content.formHtml && (
              <div 
                className="prose max-w-none mt-6"
                dangerouslySetInnerHTML={{ __html: content.formHtml }} 
              />
            )}
          </div>

          {/* Right column - Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {showCardFields ? "Informações de Pagamento" : "Complete para acessar o conteúdo"}
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
                          <Input 
                            placeholder="seu@email.com" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Quando o email é preenchido, atualiza o estado
                              if (showCardFields) {
                                initialForm.setValue('email', e.target.value);
                              }
                            }}
                          />
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
                        <FormLabel>Contribuição (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="R$ 0,00"
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value;
                              value = value.replace(/[^\d,]/g, '');
                              if (!value.startsWith('R$ ')) {
                                value = 'R$ ' + value;
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showCardFields && (
                    <>
                      <FormField
                        control={initialForm.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Cartão</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                placeholder="1234 5678 9012 3456" 
                                {...field}
                                onChange={(e) => {
                                  // Permite apenas números e espaços
                                  const value = e.target.value.replace(/[^\d\s]/g, '');
                                  // Limita a 19 caracteres (16 números + 3 espaços)
                                  if (value.length <= 19) {
                                    field.onChange(value);
                                  }
                                }}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={initialForm.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Validade</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="MM/AA" 
                                  {...field}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    if (value.length >= 2) {
                                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                    }
                                    if (value.length <= 5) {
                                      field.onChange(value);
                                    }
                                  }}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={initialForm.control}
                          name="cardCvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="123" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 4) {
                                      field.onChange(value);
                                    }
                                  }}
                                  value={field.value || ''}
                                  maxLength={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={initialForm.control}
                        name="cardName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome no Cartão</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="NOME COMPLETO" 
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.toUpperCase();
                                  field.onChange(value);
                                }}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={initialForm.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="123.456.789-00" 
                                {...field}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length > 0) {
                                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                                  }
                                  if (value.length <= 14) {
                                    field.onChange(value);
                                  }
                                }}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full transition-colors",
                      "hover:opacity-90"
                    )}
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {showCardFields ? "Processando pagamento..." : "Processando..."}
                      </>
                    ) : (
                      showCardFields ? "Finalizar Pagamento" : "Continuar"
                    )}
                  </Button>

                  {showCardFields && (
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowCardFields(false);
                        initialForm.reset();
                      }}
                      disabled={isSubmitting}
                    >
                      Voltar
                    </Button>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;

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
import { useMercadoPagoPix } from "@/hooks/useMercadoPagoPix";
import { PixModal } from "@/components/PixModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReviewSection } from "@/components/ReviewSection";

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
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [showPixModal, setShowPixModal] = useState(false);
  const mpPix = useMercadoPagoPix();

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

  const handlePixPayment = async (email: string, amount: number) => {
    try {
      const paymentData = {
        transaction_amount: amount,
        description: `Contribuição para ${content?.capture_page_title || content?.titulo}`,
        payer: {
          email: email,
        }
      };

      const response = await mpPix.createPixPayment(paymentData);
      setShowPixModal(true);

      return response;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  };

  const handlePixSuccess = async () => {
    if (mpPix.paymentId) {
      try {
        const contributionAmount = parseFloat(initialForm.getValues("contribuicao").replace(/[^\d,]/g, '').replace(',', '.'));
        
        const response = await fetch(`/api/public/contents/${slug}/access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: initialForm.getValues("email"),
            contribution_amount: contributionAmount,
            payment_id: mpPix.paymentId,
            payment_status: 'approved',
            payment_method: 'pix'
          }),
        });

        if (!response.ok) {
          throw new Error('Falha ao registrar o acesso');
        }

        navigate(`/entrega/${slug}`, {
          state: {
            email: initialForm.getValues("email"),
            contribuicao: contributionAmount,
            status: "approved",
            payment_id: mpPix.paymentId,
            payment_method: 'pix'
          }
        });

        toast({
          title: "Pagamento aprovado!",
          description: "Seu acesso ao conteúdo foi liberado.",
        });
      } catch (error) {
        console.error('Erro ao registrar acesso:', error);
        toast({
          title: "Erro ao registrar acesso",
          description: "O pagamento foi aprovado, mas houve um erro ao registrar seu acesso. Por favor, entre em contato com o suporte.",
          variant: "destructive"
        });
      }
    }
  };

  const onInitialSubmit = async (values: z.infer<typeof initialFormSchema>) => {
    const contribuicao = parseFloat(values.contribuicao.replace(/[^\d,]/g, '').replace(',', '.'));
    
    try {
      if (!values.email) {
        toast({
          title: "Email obrigatório",
          description: "Por favor, preencha seu email para continuar.",
          variant: "destructive"
        });
        return;
      }

      if (contribuicao === 0) {
        // Registra o acesso gratuito
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
        // Se houver contribuição, mostra as opções de pagamento
        setShowCardFields(true);
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

  const getPaymentErrorMessage = (status: string, statusDetail: string) => {
    const errorMessages: { [key: string]: string } = {
      'cc_rejected_high_risk': 'O pagamento foi rejeitado por questões de segurança. Por favor, use outro cartão ou escolha outro método de pagamento.',
      'cc_rejected_bad_filled_security_code': 'O código de segurança está incorreto. Por favor, verifique e tente novamente.',
      'cc_rejected_bad_filled_date': 'A data de validade está incorreta. Por favor, verifique e tente novamente.',
      'cc_rejected_bad_filled_other': 'Alguma informação do cartão está incorreta. Por favor, verifique todos os dados.',
      'cc_rejected_call_for_authorize': 'Você precisa autorizar o pagamento com sua operadora de cartão.',
      'cc_rejected_insufficient_amount': 'O cartão não possui saldo suficiente.',
      'cc_rejected_invalid_installments': 'O cartão não processa pagamentos parcelados.',
      'cc_rejected_duplicated_payment': 'Você já realizou um pagamento com este valor. Se precisar pagar novamente, aguarde alguns minutos.',
      'cc_rejected_card_disabled': 'Cartão desabilitado. Por favor, entre em contato com sua operadora.',
      'cc_rejected_blacklist': 'O pagamento foi rejeitado. Por favor, escolha outro método de pagamento.'
    };

    return errorMessages[statusDetail] || 'Houve um erro ao processar seu pagamento. Por favor, tente novamente ou escolha outro método de pagamento.';
  };

  const onCheckoutSubmit = async (values: z.infer<typeof checkoutFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(initialForm.getValues("contribuicao").replace(/[^\d,]/g, '').replace(',', '.'));
      
      // Criar um objeto de pagamento para o Mercado Pago
      const paymentData = {
        transaction_amount: amount,
        description: `Contribuição para ${content?.capture_page_title || content?.titulo}`,
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
        // Registra o acesso somente após a aprovação do pagamento
        const accessResponse = await fetch(`/api/public/contents/${slug}/access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: initialForm.getValues("email"),
            contribution_amount: amount,
            payment_id: response.id,
            payment_status: response.status,
            payment_method: 'credit_card'
          }),
        });

        if (!accessResponse.ok) {
          throw new Error('Falha ao registrar o acesso');
        }

        navigate(`/entrega/${slug}`, { 
          state: { 
            email: initialForm.getValues("email"),
            contribuicao: amount,
            status: response.status,
            payment_id: response.id,
            payment_method: 'credit_card'
          } 
        });
        
        toast({
          title: "Pagamento aprovado!",
          description: "Seu acesso ao conteúdo foi liberado.",
        });
      } else {
        const errorMessage = getPaymentErrorMessage(response.status, response.status_detail);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : "Houve um erro ao processar seu pagamento. Tente novamente.",
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
            <h1 className="text-3xl font-bold mb-2">{content.capture_page_title || content.titulo}</h1>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{content.capture_page_description || content.descricao}</p>
            
            {/* Featured image */}
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
              <img 
                src={content.capture_page_banner_url || content.thumbnail_url} 
                alt={content.capture_page_title || content.titulo} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Video player */}
            {content.capture_page_video_url && (
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={content.capture_page_video_url} 
                  title="Video preview"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}
            
            {/* Custom HTML content */}
            {content.capture_page_html && (
              <div 
                className="prose max-w-none mt-6"
                dangerouslySetInnerHTML={{ __html: content.capture_page_html }} 
              />
            )}
          </div>

          {/* Right column - Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {showCardFields ? "Informações de Pagamento" : "Complete para acessar o conteúdo"}
              </h2>

              {/* Step 1: Initial Form */}
              {!showCardFields ? (
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
                    <Button 
                      type="submit" 
                      className={cn("w-full transition-colors", "hover:opacity-90")}
                      style={{ backgroundColor: primaryColor, color: 'white' }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : "Continuar"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <>
                  {/* Step 2: Payment Method Selection */}
                  <div className="mb-6">
                    <RadioGroup
                      defaultValue="credit_card"
                      onValueChange={(value) => setPaymentMethod(value as 'credit_card' | 'pix')}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="relative rounded-lg border p-4 cursor-pointer hover:border-primary">
                        <RadioGroupItem value="credit_card" id="credit_card" className="absolute right-4 top-4" />
                        <label htmlFor="credit_card" className="block cursor-pointer">
                          <span className="font-medium block mb-1">Cartão de Crédito</span>
                          <span className="text-sm text-gray-500">Pagamento em até 12x</span>
                        </label>
                      </div>
                      <div className="relative rounded-lg border p-4 cursor-pointer hover:border-primary">
                        <RadioGroupItem value="pix" id="pix" className="absolute right-4 top-4" />
                        <label htmlFor="pix" className="block cursor-pointer">
                          <span className="font-medium block mb-1">PIX</span>
                          <span className="text-sm text-gray-500">Pagamento instantâneo</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Step 3: Payment Form */}
                  {paymentMethod === 'credit_card' ? (
                    <Form {...checkoutForm}>
                      <form onSubmit={checkoutForm.handleSubmit(onCheckoutSubmit)} className="space-y-4">
                        {/* Credit Card Form Fields */}
                        <FormField
                          control={checkoutForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número do Cartão</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="1234 5678 9012 3456" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^\d\s]/g, '');
                                    if (value.length <= 19) {
                                      field.onChange(value);
                                    }
                                  }}
                                />
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
                                  />
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
                                  <Input 
                                    placeholder="123" 
                                    {...field}
                                    maxLength={4}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '');
                                      if (value.length <= 4) {
                                        field.onChange(value);
                                      }
                                    }}
                                  />
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
                                <Input 
                                  placeholder="NOME COMPLETO" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    field.onChange(value);
                                  }}
                                />
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
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className={cn("w-full transition-colors", "hover:opacity-90")}
                          style={{ backgroundColor: primaryColor, color: 'white' }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processando...
                            </>
                          ) : "Finalizar Pagamento"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    // Formulário PIX
                    <div className="space-y-4">
                      <Button 
                        type="button"
                        className={cn("w-full transition-colors", "hover:opacity-90")}
                        style={{ backgroundColor: primaryColor, color: 'white' }}
                        disabled={isSubmitting}
                        onClick={() => {
                          const amount = parseFloat(initialForm.getValues("contribuicao").replace(/[^\d,]/g, '').replace(',', '.'));
                          const email = initialForm.getValues("email");
                          handlePixPayment(email, amount);
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : "Gerar QR Code PIX"}
                      </Button>
                    </div>
                  )}

                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      setShowCardFields(false);
                      initialForm.reset();
                    }}
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                </>
              )}
            </div>

            {/* Trust Message Section */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-lg font-medium">Pagamento 100% Seguro</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Seus pagamentos são processados com segurança pelo Mercado Pago, 
                a maior plataforma de pagamentos da América Latina.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Criptografia de ponta a ponta</span>
                <span className="mx-2">•</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Ambiente seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Section - Full width */}
        <div className="mt-12">
          <ReviewSection contentSlug={slug} />
        </div>
      </div>

      <PixModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        qrCode={mpPix.qrCode}
        qrCodeBase64={mpPix.qrCodeBase64}
        paymentId={mpPix.paymentId}
        onPaymentSuccess={handlePixSuccess}
        checkStatus={mpPix.checkPixStatus}
      />
    </div>
  );
};

export default FormPage;

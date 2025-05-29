import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, Settings, CreditCard, Webhook, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

// Schema for webhook settings
const webhookSettingsSchema = z.object({
  webhookUrl: z.string().url("Deve ser uma URL válida").optional().or(z.literal("")),
  secretKey: z.string().optional(),
  enabledEvents: z.array(z.string()).default([]),
  retryAttempts: z.number().min(0).max(10).default(3),
  timeout: z.number().min(1).max(30).default(10),
});

// Schema for checkout page
const checkoutPageSchema = z.object({
  checkoutTitle: z.string().min(5).optional().or(z.literal("")),
  checkoutDescription: z.string().min(10).optional().or(z.literal("")),
  paymentButtonText: z.string().min(3).optional().or(z.literal("")),
  successMessage: z.string().min(5).optional().or(z.literal("")),
  merchantName: z.string().min(3).optional().or(z.literal("")),
  merchantId: z.string().min(5).optional().or(z.literal(""))
});

// Schema for general settings
const generalSettingsSchema = z.object({
  siteName: z.string().min(3),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  footerText: z.string(),
  contactEmail: z.string().email(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: "Deve ser um código de cor hexadecimal válido (ex: #0066CC)",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: "Deve ser um código de cor hexadecimal válido (ex: #0066CC)",
  }),
  heroGradientFrom: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: "Deve ser um código de cor hexadecimal válido (ex: #0066CC)",
  }),
  heroGradientVia: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: "Deve ser um código de cor hexadecimal válido (ex: #0066CC)",
  }),
  heroGradientTo: z.string().regex(/^#([A-Fa-f0-9]{6})$/, {
    message: "Deve ser um código de cor hexadecimal válido (ex: #0066CC)",
  }),
  // Redes sociais - todas opcionais
  facebookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  twitterUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  youtubeUrl: z.string().url("URL inválida").optional().or(z.literal(""))
});

const availableEvents = [
  { id: "payment_success", label: "Pagamento Aprovado" },
  { id: "payment_failure", label: "Pagamento Recusado" },
  { id: "access_granted", label: "Acesso Liberado" },
  { id: "content_created", label: "Conteúdo Criado" },
  { id: "content_updated", label: "Conteúdo Atualizado" },
  { id: "content_published", label: "Conteúdo Publicado" },
  { id: "content.access.created", label: "Acesso ao Conteúdo Criado" },
];

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';

  // Webhook form
  const webhookForm = useForm<z.infer<typeof webhookSettingsSchema>>({
    resolver: zodResolver(webhookSettingsSchema),
    defaultValues: {
      webhookUrl: "",
      secretKey: "",
      enabledEvents: [],
      retryAttempts: 3,
      timeout: 10,
    },
  });

  // Checkout form
  const checkoutForm = useForm<z.infer<typeof checkoutPageSchema>>({
    resolver: zodResolver(checkoutPageSchema),
    defaultValues: {
      checkoutTitle: "Finalizar contribuição",
      checkoutDescription: "Complete o pagamento para acessar o conteúdo",
      paymentButtonText: "Pagar e Acessar Conteúdo",
      successMessage: "Obrigado pela sua contribuição! Seu acesso foi liberado.",
      merchantName: "Conteúdo Premium",
      merchantId: "MP12345678",
    },
  });

  // General settings form
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
  });

  // Carrega as configurações ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Erro ao carregar configurações');
        }
        const data = await response.json();
        
        // Atualiza formulário geral com valores padrão para campos nulos
        generalForm.reset({
          siteName: data.siteName || '',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          footerText: data.footerText || '',
          contactEmail: data.contactEmail || '',
          primaryColor: data.primaryColor || '#4361ee',
          secondaryColor: data.secondaryColor || '#3f37c9',
          heroGradientFrom: data.heroGradientFrom || '#dbeafe',
          heroGradientVia: data.heroGradientVia || '#faf5ff',
          heroGradientTo: data.heroGradientTo || '#e0e7ff',
          facebookUrl: data.facebookUrl || '',
          instagramUrl: data.instagramUrl || '',
          twitterUrl: data.twitterUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          youtubeUrl: data.youtubeUrl || ''
        });
        
        // Atualiza formulário de checkout com valores padrão para campos nulos
        checkoutForm.reset({
          checkoutTitle: data.checkoutTitle || '',
          checkoutDescription: data.checkoutDescription || '',
          paymentButtonText: data.paymentButtonText || '',
          successMessage: data.successMessage || '',
          merchantName: data.merchantName || '',
          merchantId: data.merchantId || ''
        });

        // Atualiza formulário de webhook com valores padrão para campos nulos
        webhookForm.reset({
          webhookUrl: data.webhookUrl || '',
          secretKey: data.secretKey || '',
          enabledEvents: JSON.parse(data.enabledEvents || '[]'),
          retryAttempts: data.retryAttempts || 3,
          timeout: data.timeout || 10
        });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle form submission
  const onSubmitGeneral = async (values: z.infer<typeof generalSettingsSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Obter token do localStorage para consistência
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Não autorizado. Por favor, faça login novamente.');
      }

      // Buscar configurações atuais
      const settingsResponse = await fetch('/api/settings');
      if (!settingsResponse.ok) {
        throw new Error('Erro ao carregar configurações existentes');
      }
      const currentSettings = await settingsResponse.json();

      // Mesclar configurações atuais com as novas configurações gerais
      const updatedSettings = {
        ...currentSettings,
        ...values
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar configurações');
      }

      const data = await response.json();

      toast({
        title: "Sucesso",
        description: "As configurações foram atualizadas com sucesso.",
      });

      // Atualiza o formulário com os dados mais recentes
      generalForm.reset(data);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCheckout = async (values: z.infer<typeof checkoutPageSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Obter token do localStorage para consistência
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Não autorizado. Por favor, faça login novamente.');
      }

      // Buscar configurações atuais
      const settingsResponse = await fetch('/api/settings');
      if (!settingsResponse.ok) {
        throw new Error('Erro ao carregar configurações existentes');
      }
      const currentSettings = await settingsResponse.json();

      // Mesclar configurações atuais com as novas configurações de checkout
      const updatedSettings = {
        ...currentSettings,
        ...values
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar configurações');
      }

      const data = await response.json();

      toast({
        title: "Sucesso",
        description: "As configurações de checkout foram atualizadas com sucesso.",
      });

      // Atualiza o formulário com os dados mais recentes
      checkoutForm.reset(data);
    } catch (error) {
      console.error('Erro ao salvar configurações de checkout:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar as configurações de checkout.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitWebhook = async (values: z.infer<typeof webhookSettingsSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Obter token do localStorage para consistência
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('Não autorizado. Por favor, faça login novamente.');
      }

      // Buscar configurações atuais
      const settingsResponse = await fetch('/api/settings');
      if (!settingsResponse.ok) {
        throw new Error('Erro ao carregar configurações existentes');
      }
      const currentSettings = await settingsResponse.json();

      // Converter array de eventos para string JSON para salvar no banco
      const updatedSettings = {
        ...currentSettings,
        webhookUrl: values.webhookUrl,
        secretKey: values.secretKey,
        enabledEvents: JSON.stringify(values.enabledEvents),
        retryAttempts: values.retryAttempts,
        timeout: values.timeout
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar configurações');
      }

      const data = await response.json();

      toast({
        title: "Sucesso",
        description: "As configurações de webhook foram atualizadas com sucesso.",
      });

      // Atualiza o formulário com os dados mais recentes
      webhookForm.reset({
        webhookUrl: data.webhookUrl,
        secretKey: data.secretKey,
        enabledEvents: JSON.parse(data.enabledEvents || '[]'),
        retryAttempts: data.retryAttempts,
        timeout: data.timeout
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de webhook:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar as configurações de webhook.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Site</h1>
        <p className="text-gray-600">
          Personalize as configurações gerais, checkout e webhooks do seu site.
        </p>
      </div>

      <Tabs 
        defaultValue="general" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="checkout">
            <CreditCard className="h-4 w-4 mr-2" />
            Checkout
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={generalForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Site</FormLabel>
                        <FormControl>
                          <Input placeholder="Conteúdo Premium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contato</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contato@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Logo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para usar o logo padrão</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Favicon</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com/favicon.ico" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para usar o favicon padrão</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={generalForm.control}
                  name="footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto do Rodapé</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cores do Site */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Cores do Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={generalForm.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Primária</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <div 
                            className="h-10 w-10 rounded-md border" 
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                        <FormDescription>Código hexadecimal (ex: #4361ee)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Secundária</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <div 
                            className="h-10 w-10 rounded-md border" 
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                        <FormDescription>Código hexadecimal (ex: #3f37c9)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cores do Gradiente Hero */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Gradiente da Seção Hero</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={generalForm.control}
                    name="heroGradientFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Inicial</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <div 
                            className="h-10 w-10 rounded-md border" 
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                        <FormDescription>Primeira cor do gradiente</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="heroGradientVia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Intermediária</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <div 
                            className="h-10 w-10 rounded-md border" 
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                        <FormDescription>Cor do meio do gradiente</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="heroGradientTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Final</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <div 
                            className="h-10 w-10 rounded-md border" 
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                        <FormDescription>Última cor do gradiente</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={generalForm.control}
                    name="facebookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/seuusuario" {...field} />
                        </FormControl>
                        <FormDescription>Link do seu perfil no Facebook</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/seuusuario" {...field} />
                        </FormControl>
                        <FormDescription>Link do seu perfil no Instagram</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="twitterUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter/X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/seuusuario" {...field} />
                        </FormControl>
                        <FormDescription>Link do seu perfil no Twitter/X</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/seuusuario" {...field} />
                        </FormControl>
                        <FormDescription>Link do seu perfil no LinkedIn</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/@seucanal" {...field} />
                        </FormControl>
                        <FormDescription>Link do seu canal no YouTube</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "transition-colors",
                  "hover:opacity-90"
                )}
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Checkout Tab */}
        <TabsContent value="checkout" className="space-y-4">
          <Form {...checkoutForm}>
            <form onSubmit={checkoutForm.handleSubmit(onSubmitCheckout)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={checkoutForm.control}
                  name="checkoutTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Página de Checkout</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={checkoutForm.control}
                  name="checkoutDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Checkout</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={checkoutForm.control}
                  name="paymentButtonText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto do Botão de Pagamento</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={checkoutForm.control}
                  name="successMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem de Sucesso</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium">Configurações do Mercado Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={checkoutForm.control}
                    name="merchantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Comerciante</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={checkoutForm.control}
                    name="merchantId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Comerciante</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "transition-colors",
                  "hover:opacity-90"
                )}
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Form {...webhookForm}>
            <form onSubmit={webhookForm.handleSubmit(onSubmitWebhook)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuração do Webhook</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={webhookForm.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Webhook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://seu-dominio.com/webhook" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL onde os eventos serão enviados via POST
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={webhookForm.control}
                    name="secretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave Secreta (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="sua-chave-secreta" {...field} />
                        </FormControl>
                        <FormDescription>
                          Chave para assinar as requisições (recomendado para segurança)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={webhookForm.control}
                    name="retryAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tentativas de Retry</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de tentativas em caso de falha (0-10)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={webhookForm.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (segundos)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="30" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                          />
                        </FormControl>
                        <FormDescription>
                          Tempo limite para a requisição (1-30 segundos)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Eventos */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Eventos para Rastreamento</h3>
                <p className="text-sm text-gray-600">
                  Selecione os eventos que deseja receber notificações via webhook
                </p>
                
                <FormField
                  control={webhookForm.control}
                  name="enabledEvents"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableEvents.map((event) => (
                          <FormField
                            key={event.id}
                            control={webhookForm.control}
                            name="enabledEvents"
                            render={({ field }) => (
                              <FormItem
                                key={event.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(event.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, event.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== event.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {event.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "transition-colors",
                  "hover:opacity-90"
                )}
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettings;

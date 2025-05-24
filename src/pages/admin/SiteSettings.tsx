import { useState } from "react";
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
  checkoutTitle: z.string().min(5),
  checkoutDescription: z.string().min(10),
  paymentButtonText: z.string().min(3),
  successMessage: z.string().min(5),
  merchantName: z.string().min(3),
  merchantId: z.string().min(5),
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
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
});

// Available webhook events
const availableEvents = [
  { id: "donation.completed", label: "Doação Concluída", description: "Quando uma doação é processada com sucesso" },
  { id: "donation.failed", label: "Doação Falhada", description: "Quando uma doação falha no processamento" },
  { id: "donation.pending", label: "Doação Pendente", description: "Quando uma doação está pendente de confirmação" },
  { id: "user.registered", label: "Usuário Cadastrado", description: "Quando um novo usuário se cadastra" },
  { id: "content.downloaded", label: "Conteúdo Baixado", description: "Quando um conteúdo é baixado pelo usuário" },
  { id: "content.accessed", label: "Conteúdo Acessado", description: "Quando um usuário acessa um conteúdo premium" },
  { id: "email.captured", label: "Email Capturado", description: "Quando um email é capturado na página de cadastro" },
  { id: "form.submitted", label: "Formulário Enviado", description: "Quando um formulário de contato é enviado" },
];

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    defaultValues: {
      siteName: "Conteúdo Premium",
      logoUrl: "",
      faviconUrl: "",
      footerText: "© 2025 Conteúdo Premium. Todos os direitos reservados.",
      contactEmail: "contato@conteudopremium.com",
      primaryColor: "#4361ee",
      secondaryColor: "#3f37c9",
      heroGradientFrom: "#dbeafe",
      heroGradientVia: "#faf5ff",
      heroGradientTo: "#e0e7ff",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      linkedinUrl: "",
      youtubeUrl: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    }, 1500);
  };

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
            <form onSubmit={generalForm.handleSubmit(onSubmit)} className="space-y-6">
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

              <Button type="submit" disabled={isSubmitting}>
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
            <form onSubmit={checkoutForm.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button type="submit" disabled={isSubmitting}>
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
            <form onSubmit={webhookForm.handleSubmit(onSubmit)} className="space-y-6">
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
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={event.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
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
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="font-medium">
                                      {event.label}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {event.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Exemplo de Payload */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium">Exemplo de Payload</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
{`{
  "event": "donation.completed",
  "timestamp": "2025-01-24T10:30:00Z",
  "data": {
    "donation_id": "12345",
    "amount": 50.00,
    "currency": "BRL",
    "user_email": "usuario@exemplo.com",
    "content_id": "67890",
    "content_title": "Ebook Premium"
  },
  "webhook_id": "webhook_123"
}`}
                  </pre>
                </div>
                <FormDescription>
                  Este é um exemplo de como os dados serão enviados para seu webhook
                </FormDescription>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações de Webhook"
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

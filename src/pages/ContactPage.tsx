import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Instagram, Youtube, Twitter, Facebook } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

const ContactPage = () => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      toast({
        title: "Mensagem enviada",
        description: "Agradecemos o seu contato. Responderemos em breve!",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 container-custom">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tem alguma dúvida, sugestão ou feedback? Ficaremos felizes em ajudar.
            Preencha o formulário abaixo e entraremos em contato o mais breve possível.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Informações de Contato</h2>
                <p className="text-gray-600">
                  Estamos disponíveis para ajudar você em qualquer questão relacionada 
                  aos nossos conteúdos e serviços.
                </p>
              </div>
              
              <div>
                <div className="flex items-start mb-4">
                  <Mail className="h-5 w-5 mr-3 mt-0.5" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="font-medium">E-mail</h3>
                    <p className="text-gray-600">{settings?.contactEmail || 'contato@conteudopremium.com.br'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 mr-3 mt-0.5" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="font-medium">Redes Sociais</h3>
                    <div className="mt-2 flex space-x-3">
                      {settings?.facebookUrl && (
                        <a 
                          href={settings.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors duration-200" 
                          style={{ color: '#4B5563' }} 
                          onMouseOver={(e) => e.currentTarget.style.color = primaryColor} 
                          onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                        >
                          <span className="sr-only">Facebook</span>
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {settings?.instagramUrl && (
                        <a 
                          href={settings.instagramUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors duration-200" 
                          style={{ color: '#4B5563' }} 
                          onMouseOver={(e) => e.currentTarget.style.color = primaryColor} 
                          onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                        >
                          <span className="sr-only">Instagram</span>
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {settings?.youtubeUrl && (
                        <a 
                          href={settings.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors duration-200" 
                          style={{ color: '#4B5563' }} 
                          onMouseOver={(e) => e.currentTarget.style.color = primaryColor} 
                          onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                        >
                          <span className="sr-only">YouTube</span>
                          <Youtube className="h-5 w-5" />
                        </a>
                      )}
                      {settings?.twitterUrl && (
                        <a 
                          href={settings.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors duration-200" 
                          style={{ color: '#4B5563' }} 
                          onMouseOver={(e) => e.currentTarget.style.color = primaryColor} 
                          onMouseOut={(e) => e.currentTarget.style.color = '#4B5563'}
                        >
                          <span className="sr-only">Twitter</span>
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Envie uma mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo com seus dados e mensagem.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input 
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>
                  
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
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                        Enviando...
                      </span>
                    ) : "Enviar Mensagem"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

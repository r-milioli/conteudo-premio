
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MessageSquare, Instagram, Youtube, Twitter } from "lucide-react";

const ContactPage = () => {
  const { toast } = useToast();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulando envio do formulário
    setTimeout(() => {
      console.log("Formulário enviado:", formData);
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
      setIsSubmitting(false);
    }, 1500);
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
                  <Mail className="h-5 w-5 text-brand-blue mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">E-mail</h3>
                    <p className="text-gray-600">contato@conteudopremium.com.br</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-brand-blue mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Redes Sociais</h3>
                    <div className="mt-2 flex space-x-3">
                      <a href="#" className="text-gray-500 hover:text-brand-blue">
                        <span className="sr-only">Instagram</span>
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a href="#" className="text-gray-500 hover:text-brand-blue">
                        <span className="sr-only">YouTube</span>
                        <Youtube className="h-5 w-5" />
                      </a>
                      <a href="#" className="text-gray-500 hover:text-brand-blue">
                        <span className="sr-only">Twitter</span>
                        <Twitter className="h-5 w-5" />
                      </a>
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
                    className="w-full gradient-bg"
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

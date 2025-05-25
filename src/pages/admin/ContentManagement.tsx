import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Gift, 
  Download,
  ExternalLink,
  MoreHorizontal,
  Calendar,
  User,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Schema para validação do formulário de novo conteúdo
const newContentSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  thumbnailUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  bannerImageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  capturePageTitle: z.string().min(3, "O título da página de captura deve ter pelo menos 3 caracteres"),
  capturePageDescription: z.string().min(10, "A descrição da página de captura deve ter pelo menos 10 caracteres"),
  capturePageVideoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  capturePageHtml: z.string().optional(),
  deliveryPageTitle: z.string().min(3, "O título da página de entrega deve ter pelo menos 3 caracteres"),
  deliveryPageDescription: z.string().min(10, "A descrição da página de entrega deve ter pelo menos 10 caracteres"),
  deliveryPageVideoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  deliveryPageHtml: z.string().optional(),
  downloadLink: z.string().url("URL inválida").optional().or(z.literal("")),
});

interface Content {
  id: number;
  title: string;
  description: string;
  status: 'published' | 'draft';
  created_at: string;
  downloads: number;
  accesses: number;
  slug: string;
}

const mockContents: Content[] = [
  {
    id: 1,
    title: "Guia Completo de Edição de Vídeos",
    description: "Aprenda a editar vídeos como um profissional.",
    status: "published",
    created_at: "15/05/2024",
    downloads: 325,
    accesses: 1245,
    slug: "guia-completo-edicao-videos"
  },
  {
    id: 2,
    title: "Estratégias de Marketing Digital",
    description: "As melhores estratégias para bombar seu negócio online.",
    status: "draft",
    created_at: "20/05/2024",
    downloads: 187,
    accesses: 876,
    slug: "estrategias-marketing-digital"
  },
  {
    id: 3,
    title: "Como Criar um Podcast de Sucesso",
    description: "Dicas e truques para criar um podcast de sucesso.",
    status: "published",
    created_at: "25/05/2024",
    downloads: 452,
    accesses: 1587,
    slug: "como-criar-podcast-sucesso"
  },
];

const ContentManagement = () => {
  const [contents, setContents] = useState(mockContents);
  const [isNewContentDialogOpen, setIsNewContentDialogOpen] = useState(false);
  const [isEditContentDialogOpen, setIsEditContentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Form para novo conteúdo
  const form = useForm<z.infer<typeof newContentSchema>>({
    resolver: zodResolver(newContentSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      bannerImageUrl: "",
      capturePageTitle: "",
      capturePageDescription: "",
      capturePageVideoUrl: "",
      capturePageHtml: "",
      deliveryPageTitle: "",
      deliveryPageDescription: "",
      deliveryPageVideoUrl: "",
      deliveryPageHtml: "",
      downloadLink: "",
    },
  });

  // Form para edição de conteúdo
  const editForm = useForm<z.infer<typeof newContentSchema>>({
    resolver: zodResolver(newContentSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      bannerImageUrl: "",
      capturePageTitle: "",
      capturePageDescription: "",
      capturePageVideoUrl: "",
      capturePageHtml: "",
      deliveryPageTitle: "",
      deliveryPageDescription: "",
      deliveryPageVideoUrl: "",
      deliveryPageHtml: "",
      downloadLink: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof newContentSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Simula uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Adiciona o novo conteúdo à lista
      const newContent: Content = {
        id: contents.length + 1,
        title: values.title,
        description: values.description,
        status: 'draft',
        created_at: new Date().toLocaleDateString(),
        downloads: 0,
        accesses: 0,
        slug: values.title.toLowerCase().replace(/ /g, "-"),
      };
      
      setContents([...contents, newContent]);
      setIsNewContentDialogOpen(false);
      form.reset();
      
      toast({
        title: "Sucesso",
        description: "Conteúdo criado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id: number) => {
    const contentToEdit = contents.find(content => content.id === id);
    if (contentToEdit) {
      setSelectedContent(contentToEdit);
      // Preenche o formulário com os dados do conteúdo selecionado
      editForm.reset({
        title: contentToEdit.title,
        description: contentToEdit.description,
        // Aqui você preencheria os outros campos com dados reais
        // Por enquanto vamos usar strings vazias para os campos que não temos no mock
        thumbnailUrl: "",
        bannerImageUrl: "",
        capturePageTitle: "",
        capturePageDescription: "",
        capturePageVideoUrl: "",
        capturePageHtml: "",
        deliveryPageTitle: "",
        deliveryPageDescription: "",
        deliveryPageVideoUrl: "",
        deliveryPageHtml: "",
        downloadLink: "",
      });
      setIsEditContentDialogOpen(true);
    }
  };

  const onEditSubmit = async (values: z.infer<typeof newContentSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Simula uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualiza o conteúdo na lista
      if (selectedContent) {
        setContents(contents.map(content => 
          content.id === selectedContent.id 
            ? { 
                ...content, 
                title: values.title,
                description: values.description,
                // Outros campos seriam atualizados aqui
              }
            : content
        ));
      }
      
      setIsEditContentDialogOpen(false);
      editForm.reset();
      setSelectedContent(null);
      
      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setContents(contents.filter(content => content.id !== id));
  };

  const handleViewContent = (slug: string) => {
    window.open(`/conteudo/${slug}`, '_blank');
  };

  const handleViewDonation = (slug: string) => {
    window.open(`/form/${slug}`, '_blank');
  };

  const handleViewDelivery = (slug: string) => {
    window.open(`/entrega/${slug}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Conteúdos</h1>
          <p className="text-gray-600">
            Gerencie seus conteúdos digitais e páginas personalizadas.
          </p>
        </div>
        <Button onClick={() => setIsNewContentDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <div className="grid gap-4">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{content.title}</CardTitle>
                  <CardDescription>{content.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {content.created_at}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {content.accesses} acessos
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {content.downloads} downloads
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                    {content.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(content.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Visualizar Páginas</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewContent(content.slug)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Página de Conteúdo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDonation(content.slug)}>
                        <Gift className="mr-2 h-4 w-4" />
                        Página de Doação
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDelivery(content.slug)}>
                        <Download className="mr-2 h-4 w-4" />
                        Página de Entrega
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(content.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Modal de Novo Conteúdo */}
      <Dialog open={isNewContentDialogOpen} onOpenChange={setIsNewContentDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Conteúdo</DialogTitle>
            <DialogDescription>
              Preencha as informações do seu novo conteúdo digital.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="capture">Página de Captura</TabsTrigger>
                  <TabsTrigger value="delivery">Página de Entrega</TabsTrigger>
                </TabsList>

                {/* Aba de Informações Básicas */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Guia Completo de Marketing Digital" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva seu conteúdo em detalhes..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="thumbnailUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Miniatura</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/thumbnail.jpg" {...field} />
                          </FormControl>
                          <FormDescription>Imagem pequena para listagem</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bannerImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Banner</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/banner.jpg" {...field} />
                          </FormControl>
                          <FormDescription>Imagem grande para cabeçalho</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Aba da Página de Captura */}
                <TabsContent value="capture" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="capturePageTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Página</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Acesse o Guia Completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="capturePageDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Página</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva os benefícios do seu conteúdo..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="capturePageVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Vídeo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                          </FormControl>
                          <FormDescription>Link do vídeo de apresentação (opcional)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Aba da Página de Entrega */}
                <TabsContent value="delivery" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryPageTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Página</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Seu acesso foi liberado!" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryPageDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Página</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Instruções de como acessar o conteúdo..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryPageVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Vídeo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                          </FormControl>
                          <FormDescription>Link do vídeo de boas-vindas (opcional)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="downloadLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link de Download</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/arquivo.pdf" {...field} />
                          </FormControl>
                          <FormDescription>Link direto para download do conteúdo</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewContentDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Conteúdo"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Conteúdo */}
      <Dialog open={isEditContentDialogOpen} onOpenChange={setIsEditContentDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Conteúdo</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu conteúdo digital.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="capture">Página de Captura</TabsTrigger>
                  <TabsTrigger value="delivery">Página de Entrega</TabsTrigger>
                </TabsList>

                {/* Aba de Informações Básicas */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Guia Completo de Marketing Digital" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva seu conteúdo em detalhes..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="thumbnailUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Miniatura</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/thumbnail.jpg" {...field} />
                          </FormControl>
                          <FormDescription>Imagem pequena para listagem</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="bannerImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Banner</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/banner.jpg" {...field} />
                          </FormControl>
                          <FormDescription>Imagem grande para cabeçalho</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Aba da Página de Captura */}
                <TabsContent value="capture" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={editForm.control}
                      name="capturePageTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Página</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Acesse o Guia Completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="capturePageDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Página</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva os benefícios do seu conteúdo..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="capturePageVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Vídeo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                          </FormControl>
                          <FormDescription>Link do vídeo de apresentação (opcional)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Aba da Página de Entrega */}
                <TabsContent value="delivery" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={editForm.control}
                      name="deliveryPageTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Página</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Seu acesso foi liberado!" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="deliveryPageDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Página</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Instruções de como acessar o conteúdo..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="deliveryPageVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Vídeo</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                          </FormControl>
                          <FormDescription>Link do vídeo de boas-vindas (opcional)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="downloadLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link de Download</FormLabel>
                          <FormControl>
                            <Input placeholder="https://exemplo.com/arquivo.pdf" {...field} />
                          </FormControl>
                          <FormDescription>Link direto para download do conteúdo</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditContentDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;

import { useState, useEffect } from "react";
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
  slug: string;
  thumbnail_url: string | null;
  banner_image_url: string | null;
  capture_page_title: string | null;
  capture_page_description: string | null;
  capture_page_video_url: string | null;
  capture_page_html: string | null;
  delivery_page_title: string | null;
  delivery_page_description: string | null;
  delivery_page_video_url: string | null;
  delivery_page_html: string | null;
  download_link: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  downloads: number;
  accesses: number;
}

const ContentManagement = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isNewContentDialogOpen, setIsNewContentDialogOpen] = useState(false);
  const [isEditContentDialogOpen, setIsEditContentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Carregar conteúdos ao montar o componente
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/contents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar conteúdos');
        }

        const data = await response.json();
        setContents(data);
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os conteúdos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, []);

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
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar conteúdo');
      }

      const newContent = await response.json();
      setContents([newContent, ...contents]);
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
        thumbnailUrl: contentToEdit.thumbnail_url || "",
        bannerImageUrl: contentToEdit.banner_image_url || "",
        capturePageTitle: contentToEdit.capture_page_title || "",
        capturePageDescription: contentToEdit.capture_page_description || "",
        capturePageVideoUrl: contentToEdit.capture_page_video_url || "",
        capturePageHtml: contentToEdit.capture_page_html || "",
        deliveryPageTitle: contentToEdit.delivery_page_title || "",
        deliveryPageDescription: contentToEdit.delivery_page_description || "",
        deliveryPageVideoUrl: contentToEdit.delivery_page_video_url || "",
        deliveryPageHtml: contentToEdit.delivery_page_html || "",
        downloadLink: contentToEdit.download_link || "",
      });
      setIsEditContentDialogOpen(true);
    }
  };

  const onEditSubmit = async (values: z.infer<typeof newContentSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (!selectedContent) return;

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/contents/${selectedContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar conteúdo');
      }

      const updatedContent = await response.json();
      setContents(contents.map(content => 
        content.id === selectedContent.id ? updatedContent : content
      ));
      
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

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/contents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir conteúdo');
      }

      setContents(contents.filter(content => content.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Conteúdo excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o conteúdo.",
        variant: "destructive",
      });
    }
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

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum conteúdo encontrado.</p>
          <p className="text-gray-500 text-sm">Clique em "Novo Conteúdo" para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1">
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
      )}

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

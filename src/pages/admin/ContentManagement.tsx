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
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  access_count: number;
  download_count: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ContentManagement = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isNewContentDialogOpen, setIsNewContentDialogOpen] = useState(false);
  const [isEditContentDialogOpen, setIsEditContentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';
  const itemsPerPage = 10;

  // Carregar conteúdos ao montar o componente
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/contents?page=${currentPage}&search=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar conteúdos');
        }

        const data = await response.json();
        setContents(data.contents);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
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

    // Debounce para a pesquisa
    const timeoutId = setTimeout(() => {
      fetchContents();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset para a primeira página ao pesquisar
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
    const content = contents.find(c => c.id === id);
    if (content) {
      setSelectedContent(content);
      editForm.reset({
        title: content.title || '',
        description: content.description || '',
        thumbnailUrl: content.thumbnail_url || '',
        bannerImageUrl: content.banner_image_url || '',
        capturePageTitle: content.capture_page_title || '',
        capturePageDescription: content.capture_page_description || '',
        capturePageVideoUrl: content.capture_page_video_url || '',
        capturePageHtml: content.capture_page_html || '',
        deliveryPageTitle: content.delivery_page_title || '',
        deliveryPageDescription: content.delivery_page_description || '',
        deliveryPageVideoUrl: content.delivery_page_video_url || '',
        deliveryPageHtml: content.delivery_page_html || '',
        downloadLink: content.download_link || ''
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
    window.open(`/formulario/${slug}`, '_blank');
  };

  const handleViewDelivery = (slug: string) => {
    window.open(`/entrega/${slug}`, '_blank');
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const content = contents.find(c => c.id === id);
      if (!content) return;

      const newStatus = content.status === 'published' ? 'draft' : 'published';
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/contents/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do conteúdo');
      }

      const updatedContent = await response.json();
      setContents(contents.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      ));
      
      toast({
        title: "Sucesso",
        description: `Conteúdo ${newStatus === 'published' ? 'publicado' : 'movido para rascunhos'} com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do conteúdo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Conteúdos</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gerencie seus conteúdos digitais e páginas personalizadas.
          </p>
        </div>
        <Button 
          onClick={() => setIsNewContentDialogOpen(true)}
          className={cn(
            "transition-colors w-full sm:w-auto",
            "hover:opacity-90"
          )}
          style={{ 
            backgroundColor: primaryColor,
            color: 'white'
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      {/* Barra de pesquisa */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Pesquisar conteúdos..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full"
        />
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
        <>
          <div className="grid gap-4 grid-cols-1">
            {contents.map((content) => (
              <Card key={content.id} className="overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2 w-full sm:w-auto">
                      <CardTitle className="text-lg sm:text-xl break-words">{content.title}</CardTitle>
                      <CardDescription className="text-sm break-words">{content.description}</CardDescription>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {format(new Date(content.created_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                          {content.access_count} acessos
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          {content.download_count} downloads
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      <Badge 
                        variant={content.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs sm:text-sm whitespace-nowrap"
                      >
                        {content.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel className="text-xs sm:text-sm">Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(content.id)} className="text-xs sm:text-sm">
                            <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(content.id)} className="text-xs sm:text-sm">
                            <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {content.status === 'published' ? 'Tornar Rascunho' : 'Publicar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs sm:text-sm">Visualizar Páginas</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewContent(content.slug)} className="text-xs sm:text-sm">
                            <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Página de Conteúdo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDonation(content.slug)} className="text-xs sm:text-sm">
                            <Gift className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Página de Doação
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDelivery(content.slug)} className="text-xs sm:text-sm">
                            <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Página de Entrega
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(content.id)}
                            className="text-red-600 text-xs sm:text-sm"
                          >
                            <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  style={currentPage === page ? { 
                    backgroundColor: primaryColor,
                    color: 'white'
                  } : {}}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de Novo Conteúdo */}
      <Dialog open={isNewContentDialogOpen} onOpenChange={setIsNewContentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Conteúdo</DialogTitle>
            <DialogDescription>
              Preencha as informações do seu novo conteúdo digital.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="basic" className="text-xs sm:text-sm">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="capture" className="text-xs sm:text-sm">Página de Captura</TabsTrigger>
                  <TabsTrigger value="delivery" className="text-xs sm:text-sm">Página de Entrega</TabsTrigger>
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
                            <Input placeholder="Ex: https://youtube.com/embed/..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Cole a URL do vídeo incorporado (embed) do YouTube ou Vimeo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryPageHtml"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo HTML</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Adicione conteúdo HTML personalizado..."
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Adicione conteúdo HTML personalizado que será exibido na página de entrega
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="downloadLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link para Download</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: https://drive.google.com/..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Link direto para download do conteúdo
                          </FormDescription>
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Conteúdo</DialogTitle>
            <DialogDescription>
              Atualize as informações do seu conteúdo digital.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="basic" className="text-xs sm:text-sm">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="capture" className="text-xs sm:text-sm">Página de Captura</TabsTrigger>
                  <TabsTrigger value="delivery" className="text-xs sm:text-sm">Página de Entrega</TabsTrigger>
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
                            <Input placeholder="Ex: https://youtube.com/embed/..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Cole a URL do vídeo incorporado (embed) do YouTube ou Vimeo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="deliveryPageHtml"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo HTML</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Adicione conteúdo HTML personalizado..."
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Adicione conteúdo HTML personalizado que será exibido na página de entrega
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="downloadLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link para Download</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: https://drive.google.com/..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Link direto para download do conteúdo
                          </FormDescription>
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

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
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

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

  const handleEdit = (id: number) => {
    console.log("Editar conteúdo:", id);
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Conteúdo
        </Button>
      </div>

      <div className="grid gap-6">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {content.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {content.created_at}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {content.downloads} downloads
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {content.accesses} acessos
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
    </div>
  );
};

export default ContentManagement;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Copy, Trash2, AlertCircle, Share } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  lastModified: Date;
}

interface StorageStatus {
  isConfigured: boolean;
  message: string;
}

const MediaManagement = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { settings } = useSiteSettings();
  const primaryColor = settings?.primaryColor || '#4361ee';

  useEffect(() => {
    const init = async () => {
      try {
        // Tenta verificar o status do storage
        await checkStorageStatus();
        // Se conseguiu verificar o status, carrega os arquivos
        await loadFiles();
      } catch (error) {
        console.error('Erro na inicialização:', error);
      }
    };

    init();
  }, []);

  const checkStorageStatus = async () => {
    try {
      const status = await apiFetch('/api/media/status');
      setStorageStatus(status);
    } catch (error) {
      console.error('Erro ao verificar status do storage:', error);
      if (error instanceof Error && error.message.includes('<!DOCTYPE')) {
        throw error; // Propaga o erro para ser tratado no useEffect
      }
    }
  };

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/media/files');
      setFiles(data);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      if (error instanceof Error && error.message.includes('<!DOCTYPE')) {
        throw error; // Propaga o erro para ser tratado no useEffect
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const data = await apiFetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      setFiles([{ 
        name: data.fileName,
        url: data.url,
        size: file.size,
        lastModified: new Date()
      }, ...files]);

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      await apiFetch(`/api/media/files/${fileName}`, {
        method: 'DELETE'
      });

      setFiles(files.filter(file => file.name !== fileName));
      
      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "URL da imagem copiada para a área de transferência.",
    });
  };

  const shareUrl = (url: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Compartilhar mídia',
        url: url
      }).catch(console.error);
    } else {
      copyToClipboard(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Mídia</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gerencie suas imagens e arquivos de mídia.
          </p>
        </div>

        {/* Status do Storage */}
        {storageStatus && (
          <div className={cn(
            "flex items-center gap-2 text-sm px-3 py-1 rounded-full",
            storageStatus.isConfigured ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          )}>
            <AlertCircle className="h-4 w-4" />
            {storageStatus.message}
          </div>
        )}
      </div>

      {/* Barra de pesquisa e upload */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Pesquisar arquivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading || !storageStatus?.isConfigured}
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className={cn(
              "transition-colors w-full sm:w-auto",
              "hover:opacity-90"
            )}
            style={{ 
              backgroundColor: primaryColor,
              color: 'white'
            }}
            disabled={isUploading || !storageStatus?.isConfigured}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !storageStatus?.isConfigured ? (
        <Card>
          <CardHeader>
            <CardTitle>Storage não configurado</CardTitle>
            <CardDescription>
              Configure as variáveis de ambiente do MinIO para habilitar o gerenciamento de mídia:
            </CardDescription>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>MINIO_ENDPOINT</li>
              <li>MINIO_PORT</li>
              <li>MINIO_ACCESS_KEY</li>
              <li>MINIO_SECRET_KEY</li>
              <li>MINIO_USE_SSL</li>
              <li>MINIO_BUCKET</li>
            </ul>
          </CardHeader>
        </Card>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum arquivo encontrado.</p>
          <p className="text-gray-500 text-sm">Faça upload de imagens para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.name} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video">
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex flex-col gap-2 p-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white w-full"
                      onClick={() => copyToClipboard(file.url)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white w-full"
                      onClick={() => shareUrl(file.url)}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </div>
              <CardHeader className="p-3 space-y-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate flex-1" title={file.name}>
                      {file.name}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleDelete(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManagement; 
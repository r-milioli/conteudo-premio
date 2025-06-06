import { toast } from "@/hooks/use-toast";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(url: string, options: FetchOptions = {}) {
  const { skipAuth = false, ...fetchOptions } = options;

  // Add auth token if not skipping auth and not a media endpoint
  if (!skipAuth && !url.startsWith('/api/media')) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/admin/login';
      throw new Error('Não autenticado');
    }

    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    console.log('Fazendo requisição para:', url, 'com opções:', fetchOptions);
    const response = await fetch(url, fetchOptions);
    console.log('Status da resposta:', response.status);
    
    // Log response headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Headers da resposta:', headers);

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    // Try to get response text first
    const text = await response.text();
    console.log('Resposta bruta:', text);

    // Handle 401/403 errors
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // Handle other errors
    if (!response.ok) {
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || 'Erro na requisição');
      } catch (e) {
        throw new Error('Erro na requisição: ' + text.substring(0, 100));
      }
    }

    // Parse JSON response only if there's content
    if (text.trim()) {
      try {
        const data = JSON.parse(text);
        return data;
      } catch (e) {
        throw new Error('Erro ao parsear JSON: ' + text.substring(0, 100));
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro na requisição:', error);
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : 'Erro desconhecido',
      variant: "destructive",
    });
    throw error;
  }
} 
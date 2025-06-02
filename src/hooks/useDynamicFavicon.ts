import { useEffect } from 'react';

export const useDynamicFavicon = () => {
  useEffect(() => {
    let observer: MutationObserver;

    const updateFavicon = (faviconUrl: string) => {
      // Remove qualquer favicon existente
      const existingFavicon = document.querySelector("link[rel*='icon']");
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Cria um novo elemento link para o favicon
      const link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      link.setAttribute('href', faviconUrl);
      link.setAttribute('type', 'image/x-icon');
      
      // Adiciona o novo favicon
      document.head.appendChild(link);
    };

    const setupFaviconObserver = (faviconUrl: string) => {
      // Desconecta qualquer observer existente
      if (observer) {
        observer.disconnect();
      }

      // Cria um novo observer
      observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
          const favicon = document.querySelector("link[rel*='icon']");
          if (!favicon || (favicon as HTMLLinkElement).href !== faviconUrl) {
            updateFavicon(faviconUrl);
          }
        });
      });

      // Inicia a observação
      observer.observe(document.head, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href']
      });
    };

    const fetchAndSetFavicon = async () => {
      try {
        const response = await fetch('/api/public/site-settings');
        if (!response.ok) {
          throw new Error('Falha ao buscar configurações do site');
        }

        const data = await response.json();
        console.log('Configurações do site:', data); // Log para debug
        
        if (data.faviconUrl) {
          updateFavicon(data.faviconUrl);
          setupFaviconObserver(data.faviconUrl);
        }
      } catch (error) {
        console.error('Erro ao carregar favicon:', error);
      }
    };

    // Inicializa o favicon
    fetchAndSetFavicon();

    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
}; 
import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const DynamicHead = () => {
  const { settings } = useSiteSettings();
  const siteName = settings?.siteName || 'Conteúdo Premium';
  const favicon = settings?.faviconUrl || '/favicon.ico';

  useEffect(() => {
    // Atualiza o título da página
    document.title = `${siteName} - Painel Administrativo`;

    // Atualiza o favicon
    const linkElement = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    linkElement.type = 'image/x-icon';
    linkElement.rel = 'shortcut icon';
    linkElement.href = favicon;
    document.getElementsByTagName('head')[0].appendChild(linkElement);
  }, [siteName, favicon]);

  return null;
};

export default DynamicHead; 
import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function DynamicHead() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    // Update favicon
    const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (faviconElement) {
      faviconElement.href = settings?.faviconUrl || '/favicon.ico';
    }
  }, [settings?.faviconUrl]);

  return null;
} 
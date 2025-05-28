import { useState, useEffect } from 'react';

interface SiteSettings {
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerText: string;
  contactEmail: string;
  primaryColor: string;
  secondaryColor: string;
  heroGradientFrom: string;
  heroGradientVia: string;
  heroGradientTo: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  // ... outros campos conforme necessário
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/public/site-settings');
        if (!response.ok) {
          throw new Error('Falha ao carregar configurações do site');
        }
        const data = await response.json();
        setSettings(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
} 
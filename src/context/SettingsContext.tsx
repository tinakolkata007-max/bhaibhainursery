import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refresh: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  store_name: 'Green Haven Nursery',
  whatsapp_number: '919999999999',
  delivery_charge: 0,
  currency_symbol: '₹',
  hero_title: 'Bring Nature Home',
  hero_subtitle: 'Hand-picked, healthy plants delivered to your doorstep',
  about_text:
    'We are a family-run nursery passionate about bringing greenery into every home. Every plant is carefully nurtured and quality-checked before it reaches you.',
  contact_email: 'contact@greenhavennursery.com',
  contact_phone: '+91 99999 99999',
  address: '123 Garden Road, Green City, India 560001',
  instagram_url: '',
  facebook_url: '',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setSettings(data || DEFAULT_SETTINGS);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

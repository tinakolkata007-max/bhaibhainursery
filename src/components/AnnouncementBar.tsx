import { X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useState, useEffect } from 'react';

export default function AnnouncementBar() {
  const { settings } = useSettings();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-dismissed');
    if (dismissed) setVisible(false);
  }, []);

  if (!visible || !settings?.announcement_bar) return null;

  return (
    <div className="bg-secondary-500 text-white text-sm py-2 px-4 text-center relative">
      <p className="font-medium">{settings.announcement_bar}</p>
      <button
        onClick={() => { setVisible(false); sessionStorage.setItem('announcement-dismissed', '1'); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

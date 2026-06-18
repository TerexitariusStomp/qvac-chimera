import { useState, useEffect } from 'react';
import { Smartphone, Download, Apple, ArrowRight } from 'lucide-react';

export function MobileInstallPrompt() {
  const [isMobile, setIsMobile] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobile);

    if (/Android/i.test(ua)) setPlatform('android');
    else if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('ios');

    // Check if already installed (display-mode: standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS: check if standalone is supported
    if ('standalone' in navigator) {
      setIsInstallable(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isMobile) return null;
  if (installed) {
    return (
      <div className="rounded-xl border border-green-400/15 bg-green-400/5 p-5 text-center">
        <Smartphone size={20} className="text-green-400 mx-auto mb-2" />
        <p className="text-green-300 text-sm font-medium">App installed</p>
        <p className="text-white/30 text-xs mt-1">Open from your home screen</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
          <Smartphone size={16} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Install on your phone</h3>
          <p className="text-white/30 text-xs">Add Chimera to your home screen</p>
        </div>
      </div>

      {platform === 'android' && isInstallable && (
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-300 text-black text-sm font-semibold hover:from-cyan-300 hover:to-cyan-200 transition-all"
        >
          <Download size={14} />
          Install App
          <ArrowRight size={14} />
        </button>
      )}

      {platform === 'android' && !isInstallable && (
        <div className="text-left text-xs text-white/40 space-y-1.5">
          <p>1. Tap the menu (⋮) in your browser</p>
          <p>2. Select <strong className="text-white/60">"Add to Home Screen"</strong></p>
          <p>3. Open the app from your home screen</p>
        </div>
      )}

      {platform === 'ios' && (
        <div className="text-left text-xs text-white/40 space-y-1.5">
          <p>1. Tap the <strong className="text-white/60">Share</strong> button in Safari</p>
          <p>2. Scroll down and tap <strong className="text-white/60">"Add to Home Screen"</strong></p>
          <p>3. Tap <strong className="text-white/60">"Add"</strong> to install</p>
        </div>
      )}
    </div>
  );
}

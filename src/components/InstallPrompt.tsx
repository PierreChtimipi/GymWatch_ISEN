import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détecter iOS (Safari ne supporte pas beforeinstallprompt)
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const standalone = window.matchMedia('(display-mode: standalone)').matches;

    if (ios && !standalone) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt__content">
        <img src="/pwa-64x64.png" alt="GymWatch" className="install-prompt__icon" />
        <div className="install-prompt__text">
          <strong>Installer GymWatch</strong>
          {isIOS ? (
            <p>Appuyez sur <strong>⎋ Partager</strong> puis <strong>« Sur l'écran d'accueil »</strong></p>
          ) : (
            <p>Accédez à votre salle depuis l'écran d'accueil</p>
          )}
        </div>
        <div className="install-prompt__actions">
          {!isIOS && (
            <button className="install-prompt__btn install-prompt__btn--primary" onClick={handleInstall}>
              <Download size={16} />
              Installer
            </button>
          )}
          <button className="install-prompt__btn install-prompt__btn--ghost" onClick={() => setVisible(false)}>
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

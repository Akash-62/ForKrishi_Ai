import { Leaf, Home, Clock, MapPin, Globe } from 'lucide-react';
import { CurrentScreen } from '@/lib/types';

interface HeaderProps {
  currentScreen: CurrentScreen;
  navigateTo: (screen: CurrentScreen) => void;
  toggleTextSize?: () => void;
  isLargeText?: boolean;
  language: string;
  onOpenLanguage?: () => void;
}

export function Header({ currentScreen, navigateTo, toggleTextSize, isLargeText, language, onOpenLanguage }: HeaderProps) {
  return (
    <header className="w-full bg-[var(--surface)] border-b border-[var(--border-subtle)] sticky top-0 z-40 shadow-sm transition-all duration-300 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] rounded-md"
          aria-label="Go to Home"
        >
          <div className="w-8 h-8 rounded-md bg-[var(--brand-primary)] flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-[var(--brand-deep)] hidden sm:inline-block">ForKisan AI</span>
          <span className="font-semibold text-lg tracking-tight text-[var(--brand-deep)] sm:hidden">ForKisan</span>
        </button>
        
        <nav className="flex items-center gap-1 sm:gap-2">
          {onOpenLanguage && (
            <button 
              onClick={onOpenLanguage}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--brand-deep)] hover:bg-[var(--surface-soft)] rounded-full transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] mr-1"
              aria-label="Change Language"
              title="Change Language"
            >
              <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <button 
            onClick={() => navigateTo('kvk')}
            className={`p-2 rounded-full transition-colors hidden sm:flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${currentScreen === 'kvk' ? 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--brand-deep)] hover:bg-[var(--surface-soft)]'}`}
            aria-label="Find KVK"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">
              {language === 'kn' ? 'KVK ಕೇಂದ್ರ' : language === 'hi' ? 'KVK केंद्र' : 'Nearest KVK'}
            </span>
          </button>
          
          <button 
            onClick={() => navigateTo('kvk')}
            className={`p-2 rounded-full transition-colors sm:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${currentScreen === 'kvk' ? 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--brand-deep)] hover:bg-[var(--surface-soft)]'}`}
            aria-label="Find KVK"
          >
            <MapPin className="w-6 h-6" />
          </button>

          {currentScreen !== 'home' && currentScreen !== 'saved' && (
            <button 
              onClick={() => navigateTo('saved')}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--brand-deep)] hover:bg-[var(--surface-soft)] rounded-full transition-colors hidden sm:flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
              aria-label="Saved Advice"
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'kn' ? 'ಉಳಿಸಿದ ಸಲಹೆ' : language === 'hi' ? 'सहेजी सलाह' : 'Saved'}
              </span>
            </button>
          )}
          <button 
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--brand-deep)] hover:bg-[var(--surface-soft)] rounded-full transition-colors sm:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
            onClick={() => navigateTo(currentScreen === 'saved' ? 'home' : 'saved')}
            aria-label={currentScreen === 'saved' ? 'Go to Home' : 'Saved Advice'}
          >
            {currentScreen === 'saved' ? <Home className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

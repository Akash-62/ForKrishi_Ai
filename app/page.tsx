'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { CurrentScreen, AdvisoryResult } from '@/lib/types';
import { Header } from '@/components/Header';
import { HomeScreen } from '@/components/HomeScreen';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CropSelector } from '@/components/CropSelector';
import { ProblemInput } from '@/components/ProblemInput';
import { AdviceResult } from '@/components/AdviceResult';
import { FarmerUpdates } from '@/components/FarmerUpdates';
import { SavedAdvice } from '@/components/SavedAdvice';
import { KVKFinder } from '@/components/KVKFinder';

export default function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [problemText, setProblemText] = useState<string>('');
  
  const [advisoryResult, setAdvisoryResult] = useState<AdvisoryResult | null>(null);
  const [savedAdvisories, setSavedAdvisories] = useState<AdvisoryResult[]>([]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  const [isLargeText, setIsLargeText] = useState<boolean>(false);

  useEffect(() => {
    // Initial online state
    if (typeof window !== 'undefined') {
      const online = navigator.onLine;
      setTimeout(() => setIsOnline(online), 0);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('forkisan_saved');
    const savedTextSize = localStorage.getItem('forkisan_text_size');
    
    const timer = setTimeout(() => {
      if (saved) {
        try {
          setSavedAdvisories(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved advisories', e);
        }
      }
      if (savedTextSize === 'large') {
        setIsLargeText(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLargeText) {
      // 112.5% scales text from 16px to 18px base size globally inside Tailwind
      document.documentElement.style.fontSize = '112.5%';
    } else {
      document.documentElement.removeAttribute('style');
    }
  }, [isLargeText]);

  const toggleTextSize = () => {
    const newState = !isLargeText;
    setIsLargeText(newState);
    localStorage.setItem('forkisan_text_size', newState ? 'large' : 'normal');
    showToast(newState ? "Text size increased" : "Text size reset to normal");
  };

  const handleSaveAdvisory = (advisory: AdvisoryResult) => {
    const newSaved = [advisory, ...savedAdvisories].slice(0, 10);
    setSavedAdvisories(newSaved);
    localStorage.setItem('forkisan_saved', JSON.stringify(newSaved));
    showToast('Advice saved successfully');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const navigateTo = (screen: CurrentScreen) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setCurrentScreen(screen);
  };

  const startFlow = () => navigateTo('language');

  return (
    <div className="flex-1 flex flex-col items-center w-full min-h-screen overflow-x-clip transition-all duration-300">
      <Header 
        currentScreen={currentScreen} 
        navigateTo={navigateTo} 
        toggleTextSize={toggleTextSize}
        isLargeText={isLargeText}
        language={selectedLanguage}
      />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col relative transition-all duration-300">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <HomeScreen key="home" onStart={startFlow} onUpdates={() => navigateTo('updates')} onNavigate={navigateTo} language={selectedLanguage} />
          )}
          
          {currentScreen === 'language' && (
            <LanguageSelector 
              key="language"
              selected={selectedLanguage} 
              onSelect={(lang) => {
                setSelectedLanguage(lang);
                navigateTo('crop');
              }} 
              onBack={() => navigateTo('home')}
            />
          )}
          
          {currentScreen === 'crop' && (
            <CropSelector 
              key="crop"
              language={selectedLanguage}
              selected={selectedCrop} 
              onSelect={(crop) => {
                setSelectedCrop(crop);
                navigateTo('problem');
              }}
              onBack={() => navigateTo('language')}
            />
          )}
          
          {currentScreen === 'problem' && (
            <ProblemInput 
              key="problem"
              language={selectedLanguage}
              crop={selectedCrop}
              initialText={problemText}
              onChange={(text) => setProblemText(text)}
              onBack={() => navigateTo('crop')}
              onResult={(res) => {
                setAdvisoryResult(res);
                navigateTo('result');
              }}
            />
          )}
          
          {currentScreen === 'result' && advisoryResult && (
            <AdviceResult 
              key="result"
              result={advisoryResult}
              onBack={() => navigateTo('problem')}
              onSave={() => handleSaveAdvisory(advisoryResult)}
              showToast={showToast}
            />
          )}

          {currentScreen === 'updates' && (
            <FarmerUpdates key="updates" onBack={() => navigateTo('home')} language={selectedLanguage} />
          )}

          {currentScreen === 'saved' && (
            <SavedAdvice 
              key="saved"
              advisories={savedAdvisories} 
              onBack={() => navigateTo('home')}
              onOpen={(res) => {
                setAdvisoryResult(res);
                navigateTo('result');
              }}
              language={selectedLanguage}
            />
          )}

          {currentScreen === 'kvk' && (
            <KVKFinder 
              key="kvk"
              onBack={() => navigateTo('home')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Offline Notification */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-20 left-1/2 bg-red-500/95 text-white px-5 py-3 rounded-full shadow-lg z-50 text-sm font-medium flex items-center gap-2"
          >
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">You are offline. Only saved advice is accessible.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--brand-deep)] text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium animate-in slide-in-from-bottom duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

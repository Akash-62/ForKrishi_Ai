import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const LANGUAGES = [
  { id: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
  { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  { id: 'en', label: 'English', sub: 'English' }
];

const BRAND_TRANSLATIONS = [
  { text: 'ForKrishi AI' },
  { text: 'ಫಾರ್‌ಕೃಷಿ AI' },
  { text: 'फॉरकृषि AI' }
];

interface LanguageModalProps {
  isOpen: boolean;
  selectedLanguage: string;
  onSelect: (lang: string) => void;
}

export function LanguageModal({ isOpen, selectedLanguage, onSelect }: LanguageModalProps) {
  const [selected, setSelected] = useState<string>(selectedLanguage);
  const [brandIndex, setBrandIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBrandIndex((prev) => (prev + 1) % BRAND_TRANSLATIONS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
    } else {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark blurred background backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#0d1611]/75 backdrop-blur-xl"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md bg-white rounded-[32px] border border-[#eef2ef] p-6 md:p-8 shadow-[0_20px_50px_rgba(18,60,44,0.15)] overflow-hidden"
        >
          {/* Subtle natural leaf patterns inside modal background */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#1E6B4B]/5 rounded-bl-full pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#1E6B4B]/5 rounded-tr-full pointer-events-none z-0" />

          <div className="relative z-10 flex flex-col items-center">
            {/* App Logo Emblem */}
            <div className="w-12 h-12 rounded-xl bg-[#1E6B4B] flex items-center justify-center text-white shadow-md mb-3">
              <Leaf className="w-6 h-6" />
            </div>

            {/* Animated Brand Name in 3 Languages */}
            <div className="h-7 flex items-center justify-center overflow-hidden mb-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={brandIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="text-lg font-black text-[#1E6B4B] tracking-tight"
                >
                  {BRAND_TRANSLATIONS[brandIndex].text}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Simple Subtitle */}
            <h2 className="text-center font-bold text-[#7C8B80] tracking-wider uppercase text-[10px] mb-6">
              Choose your language
            </h2>

            {/* Language Selection List */}
            <div className="w-full space-y-3.5 mb-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selected === lang.id;
                return (
                  <motion.button
                    key={lang.id}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      setSelected(lang.id);
                      // Slight delay to allow checking animation to play before dismissal
                      setTimeout(() => {
                        onSelect(lang.id);
                      }, 250);
                    }}
                    className={`relative w-full p-4 rounded-[22px] border-2 text-left flex items-center justify-between transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-[#1E6B4B] bg-[#f0faf4] shadow-[0_4px_15px_rgba(30,107,75,0.06)]'
                        : 'border-[#efebe0] bg-[#fcfbfa] hover:border-[#1E6B4B]/30 hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-[#1E6B4B]' : 'text-[#17231B]'}`}>
                        {lang.label}
                      </span>
                      <span className="text-[11px] text-[#7C8B80] font-extrabold mt-0.5">
                        {lang.sub}
                      </span>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'border-[#1E6B4B] bg-[#1E6B4B] text-white scale-110 shadow-sm' 
                        : 'border-[#efebe0] bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

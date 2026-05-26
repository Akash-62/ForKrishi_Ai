import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { UI_STRINGS, Language } from '@/lib/translations';

const LANGUAGES = [
  { id: 'kn', label: 'ಕನ್ನಡ' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'en', label: 'English' }
];

export function LanguageSelector({ 
  selected, 
  onSelect,
  onBack 
}: { 
  selected: string; 
  onSelect: (lang: string) => void;
  onBack: () => void;
}) {
  const lang = (selected as Language) || 'en';
  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto flex flex-col items-center pt-4"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 self-start transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">{t.back || 'Back'}</span>
      </button>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2 text-center">
        {t.chooseLanguage || 'Choose your language'}
      </h2>
      <p className="text-[var(--text-secondary)] mb-10 text-center">
        {t.changeAnytime || 'You can change this anytime.'}
      </p>
      
      <div className="w-full space-y-4">
        {LANGUAGES.map((langItem) => {
          const isSelected = selected === langItem.id;
          return (
            <motion.button
              key={langItem.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(langItem.id)}
              className={`w-full p-6 sm:p-8 rounded-[var(--radius-lg)] border-2 text-xl font-medium transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-[var(--brand-deep)]' 
                  : 'border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--brand-primary)]/30'
              }`}
            >
              {langItem.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

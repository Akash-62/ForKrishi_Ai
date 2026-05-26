import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Bookmark, Search, Mic, Volume2 } from 'lucide-react';
import { AdvisoryResult } from '@/lib/types';
import { UI_STRINGS, Language } from '@/lib/translations';

export function SavedAdvice({ 
  advisories, 
  onBack, 
  onOpen,
  language = 'en'
}: { 
  advisories: AdvisoryResult[]; 
  onBack: () => void; 
  onOpen: (res: AdvisoryResult) => void;
  language?: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const lang = (language as Language) || 'en';
  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = lang === 'kn' ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ' : lang === 'hi' ? 'आवाज पहचान समर्थित नहीं है' : 'Speech recognition not supported';
      setVoiceFeedback(msg);
      setTimeout(() => setVoiceFeedback(null), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    let langCode = 'en-IN';
    if (lang === 'kn') langCode = 'kn-IN';
    if (lang === 'hi') langCode = 'hi-IN';
    recognition.lang = langCode;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceFeedback(lang === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇನೆ...' : lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setSearchTerm(text);
      setVoiceFeedback(lang === 'kn' ? `ಗುರುತಿಸಲಾಗಿದೆ: "${text}"` : lang === 'hi' ? `पहचाना गया: "${text}"` : `Recognized: "${text}"`);
      setTimeout(() => setVoiceFeedback(null), 3000);
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setIsListening(false);
      setVoiceFeedback(lang === 'kn' ? 'ದೋಷ ಸಂಭವಿಸಿದೆ' : lang === 'hi' ? 'त्रुटि हुई' : 'Error recognizing voice');
      setTimeout(() => setVoiceFeedback(null), 2500);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const severityColors = {
    Low: 'bg-[var(--status-low)]/10 text-[var(--status-low)] border border-[var(--status-low)]/20',
    Medium: 'bg-[var(--status-medium)]/10 text-[var(--status-medium)] border border-[var(--status-medium)]/20',
    Serious: 'bg-[var(--status-serious)]/10 text-[var(--status-serious)] border border-[var(--status-serious)]/20',
  };

  const filteredAdvisories = advisories.filter((adv) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    
    const cropMatch = adv.crop.toLowerCase().includes(term);
    const summaryMatch = adv.problemSummary.toLowerCase().includes(term);
    
    return cropMatch || summaryMatch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto flex flex-col pt-4"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 self-start transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">{t.back || 'Back'}</span>
      </button>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6">
        {t.savedAdvice || 'Saved Advice'}
      </h2>

      {advisories.length > 0 && (
        <div className="mb-6 relative flex flex-col gap-3">
          <div className="relative flex items-center bg-white rounded-2xl border border-[var(--border-subtle)] focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-light)] transition-all shadow-sm">
            <Search className="w-5 h-5 text-[var(--text-muted)] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.savedAdviceVoiceSearchPlaceholder || 'Search by crop or advice...'}
              className="w-full bg-transparent border-none py-4.5 pl-12 pr-12 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`absolute right-3 p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-100 text-rose-600 border border-rose-200 animate-pulse'
                  : 'text-[var(--brand-primary)] hover:bg-[var(--surface-soft)]'
              }`}
              title={lang === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಿ' : lang === 'hi' ? 'आवाज से खोजें' : 'Voice Search'}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence>
            {voiceFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 bg-[#f0faf4] border border-[#cbebd6] rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2 shadow-sm"
              >
                <Volume2 className="w-4.5 h-4.5 text-emerald-600 animate-bounce flex-shrink-0" />
                <span>{voiceFeedback}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {advisories.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-12 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-[var(--text-muted)] mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            {t.noSaved || 'No saved advice yet'}
          </p>
          <p className="text-[var(--text-secondary)] max-w-sm">
            {lang === 'kn' 
              ? 'ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಸಲಹೆಯನ್ನು ಪಡೆದಾಗ, ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ನಂತರ ನೋಡಲು ನೀವು ಅದನ್ನು ಇಲ್ಲಿ ಉಳಿಸಬಹುದು.' 
              : lang === 'hi' 
                ? 'जब आप अपनी फसलों के लिए सलाह प्राप्त करते हैं, तो बिना इंटरनेट के बाद में देखने के लिए आप उसे यहां सहेज सकते हैं।' 
                : 'When you get advice for your crops, you can save it here to view it later without needing the internet.'}
          </p>
        </div>
      ) : filteredAdvisories.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-12 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-[var(--text-muted)] mb-4">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            {lang === 'kn' ? 'ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : lang === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No matching advisories found'}
          </p>
          <p className="text-[var(--text-secondary)] max-w-sm">
            {lang === 'kn' 
              ? 'ದಯವಿಟ್ಟು ಬೇರೆ ಪದವನ್ನು ಬಳಸಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' 
              : lang === 'hi' 
                ? 'कृपया कोई अन्य शब्द आज़माएं या आवाज से फिर खोजें।' 
                : 'Try checking your spelling or try voice search again.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAdvisories.map((adv) => (
            <motion.button
              key={adv.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onOpen(adv)}
              className="w-full bg-white rounded-[var(--radius-lg)] p-5 border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center gap-4 text-left shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)] hover:border-[var(--brand-primary)]/30 transition-all cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">{adv.date ? formatDate(adv.date) : 'Recently'}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)]">{adv.crop}</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] truncate mb-2">{adv.problemSummary}</h3>
                <div className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${severityColors[adv.severity]}`}>
                  {adv.severity} Issue
                </div>
              </div>
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-[var(--surface-soft)] items-center justify-center text-[var(--text-secondary)] flex-shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

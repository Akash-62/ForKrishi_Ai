import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Mic, Square, Loader2, AlertCircle, Camera, ImageIcon, X, Sparkles, HelpCircle, Check, Info, ShieldAlert } from 'lucide-react';
import { AdvisoryResult } from '@/lib/types';
import { QuickTips } from './QuickTips';
import { WaveformVisualizer } from './WaveformVisualizer';
import { UI_STRINGS, CROP_TRANSLATIONS, Language, getLocalizedCropName } from '@/lib/translations';

const GUIDED_QUESTIONS = {
  en: [
    "Are the symptoms on the leaf, the stem, or the fruit?",
    "What color are the spots or damage borders?",
    "Do you see any tiny insects under the leaves?"
  ],
  kn: [
    "ರೋಗದ ಲಕ್ಷಣಗಳು ಎಲೆಯ ಮೇಲಿದೆಯೇ, ಕಾಂಡದ ಮೇಲಿದೆಯೇ ಅಥವಾ ಹಣ್ಣಿನ ಮೇಲಿದೆಯೇ?",
    "ಎಲೆಗಳ ಮೇಲಿನ ಮಚ್ಚೆಗಳು ಯಾವ ಬಣ್ಣದಲ್ಲಿವೆ?",
    "ಎಲೆಗಳ ಕೆಳಗೆ ಸಣ್ಣ ಬಿಳಿ ನುಸಿ ಅಥವಾ ಕೀಟಗಳು ಕಾಣಿಸುತ್ತಿವೆಯೇ?"
  ],
  hi: [
    "रोग के लक्षण पत्ती पर हैं, तने पर हैं या फसल के फल पर हैं?",
    "पत्तियों पर धब्बे किस रंग के हैं?",
    "क्या आपको पत्तियों के नीचे छोटे कीड़े दिखाई दे रहे हैं?"
  ]
};

const CROP_EMOJIS: Record<string, string> = {
  Tomato: '🍅',
  Paddy: '🌾',
  Ragi: '🌿',
  Chilli: '🌶',
  Maize: '🌽'
};

const getCropEmoji = (cropName: string) => {
  if (!cropName) return '🌱';
  const name = cropName.toLowerCase();
  if (name.includes('tomato')) return '🍅';
  if (name.includes('paddy') || name.includes('rice') || name.includes('धान') || name.includes('ಭತ್ತ')) return '🌾';
  if (name.includes('ragi') || name.includes('ರಾಗಿ') || name.includes('ರಾಕಿ') || name.includes('ರಾ ಗಿ') || name.includes('ರಾ ಜಿ') || name.includes('रागी')) return '🌿';
  if (name.includes('chilli') || name.includes('pepper') || name.includes('ಮೆಣಸಿನಕಾಯಿ') || name.includes('मिर्च')) return '🌶';
  if (name.includes('maize') || name.includes('corn') || name.includes('ಮೆಕ್ಕೆಜೋಳ') || name.includes('मक्का')) return '🌽';
  if (name.includes('lemon') || name.includes('citrus') || name.includes('lime') || name.includes('ನಿಂಬೆ') || name.includes('नींबू')) return '🍋';
  if (name.includes('mango') || name.includes('ಮಾವು') || name.includes('आम')) return '🥭';
  if (name.includes('cotton') || name.includes('ಹತ್ತಿ') || name.includes('कपास')) return '☁️';
  if (name.includes('groundnut') || name.includes('peanut') || name.includes('ನೆಲಗಡಲೆ') || name.includes('ಶೇಂಗಾ') || name.includes('मूंगफली')) return '🥜';
  if (name.includes('banana') || name.includes('ಬಾಳೆ') || name.includes('केला')) return '🍌';
  if (name.includes('onion') || name.includes('ಈರುಳ್ಳಿ') || name.includes(' प्याज')) return '🧅';
  if (name.includes('potato') || name.includes('ಆಲೂಗಡ್ಡೆ') || name.includes('आलू')) return '🥔';
  if (name.includes('garlic') || name.includes('ಬೆಳ್ಳುಳ್ಳಿ') || name.includes('लहसुन')) return '🧄';
  if (name.includes('ginger') || name.includes('ಶುಂಠಿ') || name.includes('अदरक')) return '🫚';
  if (name.includes('brinjal') || name.includes('eggplant') || name.includes('ಬದನೆಕಾಯಿ') || name.includes('बैंगन')) return '🍆';
  if (name.includes('wheat') || name.includes('ಗೋಧಿ') || name.includes('गेहूं')) return '🌾';
  if (name.includes('coconut') || name.includes('ತೆಂಗಿನಕಾಯಿ') || name.includes('नारियल')) return '🥥';
  if (name.includes('arecanut') || name.includes('ಅಡಿಕೆ') || name.includes('सुपारी')) return '🌴';
  return CROP_EMOJIS[cropName] || '🌱';
};

type InitialUploadSource = 'camera' | 'gallery';

export function ProblemInput({ 
  language, 
  crop, 
  initialText,
  initialImage,
  onImageChange,
  onChange,
  onBack, 
  initialUploadSource,
  onInitialUploadHandled,
  onResult 
}: { 
  language: string; 
  crop: string; 
  initialText: string;
  initialImage: string | null;
  onImageChange?: (image: string | null) => void;
  onChange: (text: string) => void;
  onBack: () => void; 
  initialUploadSource?: InitialUploadSource | null;
  onInitialUploadHandled?: () => void;
  onResult: (result: AdvisoryResult) => void;
}) {
  const [text, setText] = useState(initialText);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [image, setImage] = useState<string | null>(initialImage);
  
  const [visualReviewComplete, setVisualReviewComplete] = useState(false);
  const [visualDiagnosis, setVisualDiagnosis] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const initialUploadOpenedRef = useRef(false);

  // Guided Voice Mode States
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState<string[]>(['', '', '']);



  const t = UI_STRINGS[language as Language] || UI_STRINGS.en;
  const isKn = language === 'kn';
  const isHi = language === 'hi';
  const lang = (language as Language) || 'en';

  const recognitionRef = useRef<any>(null);
  const isGuidedModeRef = useRef(isGuidedMode);
  const guidedStepRef = useRef(guidedStep);

  useEffect(() => {
    if (!initialUploadSource || initialUploadOpenedRef.current) {
      return;
    }

    initialUploadOpenedRef.current = true;
    const timer = window.setTimeout(() => {
      const input = initialUploadSource === 'gallery' ? galleryInputRef.current : cameraInputRef.current;
      input?.click();
      onInitialUploadHandled?.();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [initialUploadSource, onInitialUploadHandled]);

  useEffect(() => {
    isGuidedModeRef.current = isGuidedMode;
  }, [isGuidedMode]);

  useEffect(() => {
    guidedStepRef.current = guidedStep;
  }, [guidedStep]);

  useEffect(() => {
    onChange(text);
  }, [text, onChange]);

  useEffect(() => {
    onImageChange?.(image);
  }, [image, onImageChange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        let langCode = 'en-IN';
        if (language === 'kn') langCode = 'kn-IN';
        if (language === 'hi') langCode = 'hi-IN';
        recognition.lang = langCode;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          
          if (isGuidedModeRef.current) {
            setGuidedAnswers(prev => {
              const next = [...prev];
              next[guidedStepRef.current] = currentTranscript;
              return next;
            });
          } else {
            setText(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          // In guided mode, only close when explicitly completed or canceled
          if (!isGuidedModeRef.current) {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setTimeout(() => setSpeechSupported(false), 0);
      }
    }
  }, [language]);

  const speakQuestion = (questionText: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      let langCode = 'en-IN';
      if (language === 'kn') langCode = 'kn-IN';
      if (language === 'hi') langCode = 'hi-IN';
      utterance.lang = langCode;

      // Select matching local voice
      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(v => v.lang.startsWith(langCode) || v.lang.replace('_', '-').startsWith(langCode));
      if (matched) {
        utterance.voice = matched;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsListening(false);
    } else {
      try {
        if (isGuidedMode) {
          setGuidedAnswers(['', '', '']);
          setGuidedStep(0);
          speakQuestion(GUIDED_QUESTIONS[lang][0]);
        }
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const progressGuidedStep = () => {
    if (guidedStep < 2) {
      const nextStep = guidedStep + 1;
      setGuidedStep(nextStep);
      speakQuestion(GUIDED_QUESTIONS[lang][nextStep]);
    } else {
      // Compile final results
      const a = guidedAnswers;
      let summary = '';
      if (lang === 'kn') {
        summary = `ಲಕ್ಷಣಗಳು: ${a[0] || 'ಲಭ್ಯವಿಲ್ಲ'}. ಚುಕ್ಕೆಗಳ ವಿವರ: ${a[1] || 'ಲಭ್ಯವಿಲ್ಲ'}. ಕೀಟಗಳು: ${a[2] || 'ಲಭ್ಯವಿಲ್ಲ'}.`;
      } else if (lang === 'hi') {
        summary = `लक्षण: ${a[0] || 'उपलब्ध नहीं'} पर हैं। धब्बे: ${a[1] || 'उपलब्ध नहीं'}। कीड़े: ${a[2] || 'उपलब्ध नहीं'}।`;
      } else {
        summary = `Symptoms on: ${a[0] || 'N/A'}. Spots details: ${a[1] || 'N/A'}. Insects visible: ${a[2] || 'N/A'}.`;
      }
      
      setText(summary);
      recognitionRef.current?.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsListening(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800; // compress for api
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const base64Img = canvas.toDataURL(file.type || 'image/jpeg', 0.8);
        setImage(base64Img);
        analyzeImage(base64Img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Img: string) => {
    setIsAnalyzingImage(true);
    setVisualDiagnosis(null);
    setVisualReviewComplete(false);
    try {
      const res = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, language, image: base64Img })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.diagnosis) {
          setVisualDiagnosis(data.diagnosis);
          setVisualReviewComplete(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  useEffect(() => {
    if (initialImage) {
      analyzeImage(initialImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeImage = () => {
    setImage(null);
    setVisualDiagnosis(null);
    setVisualReviewComplete(false);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!text.trim() && !image) {
      setError(
        isKn 
          ? "ದಯವಿಟ್ಟು ಬೆಳೆಗೆ ಏನಾಗುತ್ತಿದೆ ಎಂದು ತಿಳಿಸಿ ಅಥವಾ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ." 
          : isHi 
            ? "कृपया बताएं कि फसल के साथ क्या हो रहा है या फसल की एक फोटो अपलोड करें।" 
            : "Please tell us what is happening or upload a photo of your crop."
      );
      return;
    }
    setError(null);
    setIsLoading(true);

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, language, problem: text, image })
      });

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const finalResult: AdvisoryResult = {
        ...data,
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString(),
        crop,
        language,
        problem: text,
        image: image || undefined
      };
      
      onResult(finalResult);
    } catch (err: any) {
      console.error(err);
      setError(t.errorMsg || "We could not prepare advice right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center pt-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[var(--radius-xl)] shadow-sm border border-[var(--border-subtle)] flex flex-col items-center max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center mb-6">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            {t.understanding || 'Understanding your crop problem...'}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {t.preparing || 'Preparing simple advice...'}
          </p>
        </motion.div>
      </div>
    );
  }

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

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4 text-center">
        {t.cropProblem || 'Tell us the crop problem'}
      </h2>

      {/* Selected Crop Badge */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3 bg-[var(--brand-light)]/50 border border-[var(--brand-primary)]/15 px-5 py-3 rounded-full shadow-sm backdrop-blur-sm hover:border-[var(--brand-primary)]/35 transition-colors">
          <span className="text-2xl select-none" role="img" aria-label={crop}>
            {getCropEmoji(crop)}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-[var(--brand-primary)] font-extrabold uppercase tracking-wider">
              {language === 'kn' ? 'ಆಯ್ಕೆ ಮಾಡಿದ ಬೆಳೆ' : language === 'hi' ? 'चयनित फसल' : 'Selected Crop'}
            </span>
            <span className="text-base font-bold text-[var(--text-primary)]">
              {getLocalizedCropName(crop, lang)}
            </span>
          </div>
          <div className="h-6 w-px bg-[var(--brand-primary)]/20 mx-1" />
          <button
            onClick={onBack}
            className="text-xs font-extrabold text-rose-600 hover:text-rose-800 transition-all px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-200/50 flex items-center gap-1 active:scale-95 shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {language === 'kn' ? 'ತಪ್ಪು ಬೆಳೆ?' : language === 'hi' ? 'गलत फसल?' : 'Wrong Crop?'}
          </button>
        </div>
      </div>



      <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--border-subtle)] p-4 sm:p-8 flex flex-col items-center">
        
        {/* Guided Mode Switcher Toggle */}
        {speechSupported && (
          <div className="w-full max-w-md mb-6 bg-[var(--surface-soft)] rounded-2xl p-3 flex items-center justify-between border border-[#efede6] shadow-inner">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--brand-primary)]" />
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-[var(--text-primary)]">{t.guidedMode || 'Guided Voice Assistant'}</span>
                <span className="text-[9px] text-[var(--text-secondary)] font-medium mt-0.5">
                  {isKn ? 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನದಿಂದ ರೋಗ ಪತ್ತೆಹಚ್ಚಿ' : isHi ? 'चरण-दर-चरण आवाज मार्गदर्शन' : 'AI speaks symptoms questionnaire'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsGuidedMode(!isGuidedMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center ${isGuidedMode ? 'bg-[var(--brand-primary)] justify-end' : 'bg-gray-300 justify-start'}`}
            >
              <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        )}

        {/* Voice Input Section */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="relative mb-4">
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-[var(--brand-primary)]/10 rounded-full"
              />
            )}
            <button
              onClick={toggleListening}
              disabled={!speechSupported}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                isListening 
                  ? 'bg-[var(--brand-deep)] text-white scale-105' 
                  : speechSupported
                    ? 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-deep)] active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isListening ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>
          
          <div className="text-center min-h-[48px] flex flex-col items-center justify-center">
            {isListening ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                <WaveformVisualizer isListening={isListening} />
                <p className="font-medium text-[var(--brand-primary)] text-sm">
                  {t.listening || 'Listening... Tap again to stop'}
                </p>
              </motion.div>
            ) : !speechSupported ? (
              <p className="text-[var(--text-muted)] text-sm">
                {t.speechNotSupported || 'Speech is not supported on this browser. Please type the problem.'}
              </p>
            ) : (
              <p className="text-[var(--text-secondary)] font-medium">
                {t.tapToSpeak || 'Tap to speak'}
              </p>
            )}
          </div>
        </div>

        {/* Text Input Section */}
        <div className="w-full max-w-xl mx-auto flex flex-col mb-6">
          <label htmlFor="problemText" className="sr-only">
            {t.typeManually || 'Or type the problem below'}
          </label>
          <textarea
            id="problemText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.problemPlaceholder || 'Example: Leaves are yellow and small white insects are visible.'}
            className="w-full min-h-[120px] p-4 text-base sm:text-lg border-2 border-[var(--border-subtle)] rounded-[var(--radius-lg)] bg-[var(--bg-base)] focus:bg-white focus:border-[var(--brand-primary)] focus:outline-none transition-colors resize-y mb-4"
          />

          {/* Photo Upload Section */}
          <div className="flex flex-col w-full gap-4">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={cameraInputRef}
              onChange={handleFileChange}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={galleryInputRef}
              onChange={handleFileChange} 
            />
            
            {image ? (
              <div className="flex flex-col gap-4 w-full">
                <div className="relative w-full aspect-video sm:aspect-[4/3] rounded-[var(--radius-lg)] border-2 border-[var(--brand-primary)] overflow-hidden shadow-sm bg-black">
                  <img src={image} alt="Crop problem" className="w-full h-full object-contain" />
                  
                  {/* Real-time laser scanning line & crosshairs */}
                  {isAnalyzingImage && (
                    <>
                      <div className="absolute left-0 w-full h-[3px] bg-emerald-400 opacity-90 shadow-[0_0_12px_#1e6b4b] animate-scan z-20" />
                      
                      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-dashed border-emerald-400 rounded-lg flex items-center justify-center animate-pulse z-10">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      </div>
                      <div className="absolute top-[65%] left-[35%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-dashed border-emerald-400 rounded-lg flex items-center justify-center animate-pulse [animation-delay:0.3s] z-10">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      </div>
                    </>
                  )}
                  
                  <div className="absolute inset-x-0 top-0 p-3 flex justify-end bg-gradient-to-b from-black/50 to-transparent">
                    <button 
                      onClick={removeImage}
                      disabled={isAnalyzingImage}
                      className="bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors shadow-sm disabled:opacity-50"
                      aria-label="Remove photo"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col sm:flex-row justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent">
                    <button 
                      onClick={() => {
                        removeImage();
                        setTimeout(() => cameraInputRef.current?.click(), 100);
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full transition-colors font-medium shadow-sm active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      {isKn ? 'ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ' : isHi ? 'फिर से फोटो लें' : 'Retake Photo'}
                    </button>
                    <button
                      onClick={() => {
                        removeImage();
                        setTimeout(() => galleryInputRef.current?.click(), 100);
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full transition-colors font-medium shadow-sm active:scale-95"
                    >
                      <ImageIcon className="w-5 h-5" />
                      {isKn ? 'ಗ್ಯಾಲರಿಯಿಂದ ಆರಿಸಿ' : isHi ? 'गैलरी से चुनें' : 'Choose Gallery'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {(isAnalyzingImage || visualDiagnosis) && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full flex flex-col gap-3"
                    >
                      {/* Diagnostic summary card */}
                      <div className="w-full p-4 rounded-[var(--radius-lg)] bg-[var(--brand-light)] border border-[var(--brand-primary)]/20 shadow-sm flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5 animate-pulse" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-[var(--brand-deep)] mb-1">
                            {isKn ? 'AI ದೃಶ್ಯ ರೋಗನಿರ್ಣಯ' : isHi ? 'AI दृश्य निदान' : 'AI Visual Diagnosis'}
                          </h4>
                          {isAnalyzingImage ? (
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-primary)]" />
                              {isKn ? 'ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : isHi ? 'आपकी फसल की फोटो का विश्लेषण किया जा रहा है...' : 'Analyzing your crop photo...'}
                            </div>
                          ) : (
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{visualDiagnosis}</p>
                          )}
                        </div>
                      </div>

                      {/* Visual review status. This is intentionally not a measured disease score. */}
                      {visualReviewComplete && !isAnalyzingImage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full p-4 rounded-[var(--radius-lg)] bg-white border border-[#efebe0] shadow-sm flex items-start gap-3"
                        >
                          <Info className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-[#7C8B80] font-black uppercase tracking-wider">
                              {t.preliminaryVisualReview || 'Preliminary visual review'}
                            </span>
                            <p className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed mt-1">
                              {t.visualReviewDesc || 'The photo was reviewed by AI as supporting context. It is not a measured infection percentage or confirmed diagnosis.'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 w-full py-5 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:border-[var(--brand-primary)]/50 transition-colors font-medium cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center animate-pulse">
                    <Camera className="w-5 h-5" />
                  </div>
                  {isKn ? 'ಕ್ಯಾಮೆರಾದಿಂದ ತೆಗೆಯಿರಿ' : isHi ? 'कैमरा से लें' : 'Take Photo'}
                </button>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 w-full py-5 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:border-[var(--brand-primary)]/50 transition-colors font-medium cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  {isKn ? 'ಗ್ಯಾಲರಿಯಿಂದ ಆರಿಸಿ' : isHi ? 'गैलरी से चुनें' : 'Upload from Gallery'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-xl flex items-center gap-2 text-[var(--status-serious)] mt-4 bg-[var(--status-serious)]/10 p-3 rounded-md"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button 
          onClick={handleSubmit}
          className="w-full max-w-xl mt-8 bg-[var(--brand-primary)] text-white py-4 rounded-[var(--radius-lg)] font-semibold text-lg hover:bg-[var(--brand-deep)] transition-colors active:scale-[0.98] shadow-sm cursor-pointer"
        >
          {t.getAdvice || 'Get Advice'}
        </button>

      </div>
      
      <QuickTips crop={crop} language={language} />

      {/* Fullscreen Voice Recording Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-[#123C2C] to-[#092218] text-white z-50 flex flex-col justify-between items-center p-8 backdrop-blur-md"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between max-w-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 absolute" />
                <span className="text-[10px] text-red-200 font-extrabold uppercase tracking-widest pl-1.5">
                  {isGuidedMode 
                    ? (isKn ? 'ಮಾರ್ಗದರ್ಶಿ ಧ್ವನಿ ಸಹಾಯಕ' : isHi ? 'आवाज प्रश्नावली' : 'GUIDED AI DIAGNOSIS')
                    : (isKn ? 'ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್' : isHi ? 'ऑडियो रिकॉर्डिंग' : 'LIVE RECORDING')
                  }
                </span>
              </div>
              <div className="px-3.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-extrabold border border-white/10 uppercase tracking-wider">
                {crop} • {language}
              </div>
            </div>

            {/* Transcription & Guided Prompts Display */}
            <div className="flex-1 w-full max-w-lg flex flex-col justify-center items-center text-center px-4 my-8">
              {isGuidedMode ? (
                <div className="flex flex-col items-center gap-6">
                  {/* Step indicators */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {[0, 1, 2].map((stepIdx) => (
                      <div 
                        key={stepIdx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          guidedStep === stepIdx 
                            ? 'w-6 bg-emerald-400' 
                            : guidedStep > stepIdx 
                              ? 'w-2 bg-emerald-600' 
                              : 'w-2 bg-white/20'
                        }`} 
                      />
                    ))}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#E8F5EE] leading-normal tracking-wide">
                    {GUIDED_QUESTIONS[lang][guidedStep]}
                  </h3>
                  
                  <motion.p 
                    key={guidedStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-base sm:text-lg font-medium text-emerald-300 italic min-h-[48px] max-w-[340px]"
                  >
                    {guidedAnswers[guidedStep] ? `“${guidedAnswers[guidedStep]}”` : (isKn ? 'ಮಾತನಾಡಿ...' : isHi ? 'बोलें...' : 'Waiting for speech...')}
                  </motion.p>
                </div>
              ) : (
                <>
                  <motion.p 
                    layoutId="transcript-text"
                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#E8F5EE] leading-normal tracking-tight max-h-[30vh] overflow-y-auto w-full italic"
                  >
                    {text ? `“${text}”` : (isKn ? '“ನಿಮ್ಮ ಬೆಳೆ ಸಮಸ್ಯೆ ಬಗ್ಗೆ ಮಾತನಾಡಿ...”' : isHi ? '“अपनी फसल की समस्या के बारे में बोलें...”' : '“Start speaking about your crop problem...”')}
                  </motion.p>
                  {text && (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-4 animate-pulse">
                      {isKn ? 'ಧ್ವನಿ ಪತ್ತೆ ಯಶಸ್ವಿಯಾಗಿದೆ' : isHi ? 'आवाज पहचान ली गई' : 'Listening in real-time...'}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Glowing Waveform & Controls */}
            <div className="w-full max-w-lg flex flex-col items-center gap-6">
              {/* Massive 15-bar glowing visualizer */}
              <div className="flex items-center justify-center gap-1.5 h-16 w-full px-8">
                {Array(15).fill(0).map((_, idx) => {
                  const seedDelay = Math.abs(Math.sin(idx + 1)) * 1000;
                  const seedDuration = Math.abs(Math.cos(idx + 1)) * 1000;
                  const randomDelay = (seedDelay - Math.floor(seedDelay)) * 0.4;
                  const randomDuration = 0.5 + (seedDuration - Math.floor(seedDuration)) * 0.5;
                  return (
                    <motion.div
                      key={idx}
                      animate={{
                        height: [12, 60, 16, 48, 12],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: randomDuration,
                        delay: randomDelay,
                        ease: "easeInOut",
                      }}
                      className="w-1.5 bg-gradient-to-t from-emerald-500 to-green-300 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)] animate-pulse"
                    />
                  );
                })}
              </div>

              {/* Glowing Mic/Next Button */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-125"
                />
                
                {isGuidedMode ? (
                  <button
                    onClick={progressGuidedStep}
                    disabled={!guidedAnswers[guidedStep]}
                    className="relative z-10 px-8 py-5 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-white text-base font-black uppercase tracking-widest shadow-lg border-2 border-white/20 active:scale-95 transition-all"
                  >
                    {guidedStep < 2 
                      ? (isKn ? 'ಮುಂದಿನ ಪ್ರಶ್ನೆ' : isHi ? 'अगला प्रश्न' : 'Next Question')
                      : (isKn ? 'ಮುಕ್ತಾಯಗೊಳಿಸಿ' : isHi ? 'समाप्त करें' : 'Finish & Compile')
                    }
                  </button>
                ) : (
                  <button
                    onClick={toggleListening}
                    className="relative z-10 w-24 h-24 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-[0_10px_35px_rgba(16,185,129,0.5)] border-4 border-white/20 active:scale-95 transition-transform"
                  >
                    <Square className="w-8 h-8 fill-current" />
                  </button>
                )}
                
                <span className="text-xs text-gray-300 font-extrabold uppercase tracking-widest mt-4">
                  {isGuidedMode 
                    ? (guidedAnswers[guidedStep] ? (isKn ? 'ಮುಂದುವರೆಯಲು ಒತ್ತಿ' : isHi ? 'आगे बढ़ने के लिए दबाएं' : 'Ready! Tap to proceed') : (isKn ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ...' : isHi ? 'सुन रहा हूँ...' : 'Please speak your answer'))
                    : (isKn ? 'ಉಳಿಸಲು ಒತ್ತಿ' : isHi ? 'रोकने के लिए दबाएं' : 'Tap to stop & save')
                  }
                </span>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  recognitionRef.current?.stop();
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsListening(false);
                  if (!isGuidedMode) setText('');
                }}
                className="text-xs text-red-300 hover:text-red-200 hover:underline uppercase tracking-widest font-extrabold transition-colors mt-2"
              >
                {isKn ? 'ರದ್ದುಗೊಳಿಸಿ' : isHi ? 'रद्द करें' : 'Discard Recording'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </motion.div>
  );
}

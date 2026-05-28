import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Mic, ShieldCheck, Sparkles, Camera, Bookmark, WifiOff, Check, ChevronRight, Languages, RefreshCw, AlertTriangle, MapPin, ImageIcon } from 'lucide-react';
import { UI_STRINGS, Language } from '@/lib/translations';
import { WeatherWidget } from './WeatherWidget';
import Stack from './Stack';

type UploadSource = 'camera' | 'gallery';

const HOME_COPY = {
  en: {
    eyebrow: 'Voice-first | India-first | AI-powered',
    titleLine: 'Speak your crop problem.',
    titleHighlight: 'Get simple guidance.',
    description: 'Choose a language, speak or upload a crop photo, and get safe next steps you can act on.',
    speakAction: 'Speak Problem',
    cameraAction: 'Take Photo',
    galleryAction: 'Upload Gallery',
    updatesAction: 'Farmer Updates',
    trustVoice: 'Voice-first',
    trustLanguage: 'Local language',
    trustSteps: 'Simple next steps',
    stackHint: 'Tap a card or choose a tab',
    tabs: ['Voice', 'Photo', 'Remedy', 'Offline'],
    voice: {
      header: 'AI Voice',
      title: 'Voice Diagnosis',
      listening: 'Listening',
      translating: 'Translating',
      guidance: 'Guidance',
      farmerSpoke: 'Farmer spoke:',
      sample: 'Leaves are turning yellow and insects are visible...',
      ready: 'Ready to record',
      parser: 'AI language parser',
      translateText: 'Translating the farmer problem into a clear crop symptom note.',
      processing: 'Processing audio...',
      risk: 'Possible issue',
      issue: 'Whitefly infestation',
      issueDesc: 'Common sap-sucking pest symptoms may be present.',
      recommendation: 'Check leaf undersides and use neem-based spray only if pests are visible.',
      complete: 'Guidance ready',
      footer: 'Voice help assistant',
      cta: 'Start Voice Help'
    },
    scan: {
      header: 'AI Scanner',
      title: 'Photo Review',
      scanning: 'Reviewing',
      analyzing: 'Checking',
      guidance: 'Possible',
      active: 'Leaf photo review active',
      checking: 'Checking spot patterns',
      running: 'Reviewing photo...',
      possibleBox: 'Possible spot',
      severity: 'Possible medium risk',
      issue: 'Early blight-like spots',
      issueDesc: 'Photo symptoms may match fungal leaf spots. Avoid overhead watering and verify before treatment.',
      footer: 'Photo-based crop review',
      cta: 'Scan Leaf Now',
      alt: 'Leaf scanner demo'
    },
    remedy: {
      header: 'AI Remedy',
      title: 'Clear Action Plans',
      compiling: 'Preparing',
      alert: 'Caution',
      tasks: ['Check undersides of leaves', 'Water only near the roots', 'Keep affected plants separate'],
      treatmentReady: 'Next steps ready',
      serious: 'High risk',
      issue: 'Chilli leaf curl symptoms',
      avoidTitle: 'What to avoid',
      avoidOne: 'Do not overuse chemical sprays without confirmation.',
      avoidTwo: 'Avoid extra nitrogen fertilizer for a few days.',
      critical: 'Caution notes prepared',
      footer: 'Treatment guides',
      cta: 'Start Diagnosis'
    },
    offline: {
      header: 'Saved Guides',
      title: 'Offline Advice',
      syncing: 'Saving',
      ready: 'Offline ready',
      saved: 'Paddy guide saved',
      syncingText: 'Saving useful crop advice for offline viewing...',
      synced: 'Local advice saved',
      lowRisk: 'Low risk',
      issue: 'Paddy blast watch',
      issueDesc: 'Weather risk noted. Keep water level steady and monitor leaves.',
      cache: 'Saved on this device',
      enabled: 'Offline access enabled',
      footer: 'Saved crop advice',
      cta: 'Open Saved Guides'
    }
  },
  kn: {
    eyebrow: 'ಧ್ವನಿ ಮೊದಲು | ಭಾರತದ ರೈತರಿಗೆ | AI ಸಹಾಯ',
    titleLine: 'ನಿಮ್ಮ ಬೆಳೆ ಸಮಸ್ಯೆ ಹೇಳಿ.',
    titleHighlight: 'ಸರಳ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.',
    description: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ, ಮಾತನಾಡಿ ಅಥವಾ ಬೆಳೆಯ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ, ನಂತರ ಸುರಕ್ಷಿತ ಮುಂದಿನ ಹಂತಗಳನ್ನು ಪಡೆಯಿರಿ.',
    speakAction: 'ಸಮಸ್ಯೆ ಹೇಳಿ',
    cameraAction: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    galleryAction: 'ಗ್ಯಾಲರಿ ಅಪ್ಲೋಡ್',
    updatesAction: 'ರೈತ ಅಪ್ಡೇಟ್‌ಗಳು',
    trustVoice: 'ಧ್ವನಿ ಸಹಾಯ',
    trustLanguage: 'ಸ್ಥಳೀಯ ಭಾಷೆ',
    trustSteps: 'ಸರಳ ಹಂತಗಳು',
    stackHint: 'ಕಾರ್ಡ್ ತಟ್ಟಿರಿ ಅಥವಾ ಟ್ಯಾಬ್ ಆಯ್ಕೆಮಾಡಿ',
    tabs: ['ಧ್ವನಿ', 'ಫೋಟೋ', 'ಪರಿಹಾರ', 'ಆಫ್‌ಲೈನ್'],
    voice: {
      header: 'AI ಧ್ವನಿ',
      title: 'ಧ್ವನಿ ನಿರ್ಧಾರ',
      listening: 'ಕೇಳುತ್ತಿದೆ',
      translating: 'ಅನುವಾದ',
      guidance: 'ಸಲಹೆ',
      farmerSpoke: 'ರೈತರು ಹೇಳಿದರು:',
      sample: 'ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ ಮತ್ತು ಕೀಟಗಳು ಕಾಣುತ್ತಿವೆ...',
      ready: 'ರೆಕಾರ್ಡ್‌ಗೆ ಸಿದ್ಧ',
      parser: 'AI ಭಾಷಾ ಸಹಾಯ',
      translateText: 'ರೈತರ ಸಮಸ್ಯೆಯನ್ನು ಸ್ಪಷ್ಟ ಬೆಳೆ ಲಕ್ಷಣವಾಗಿ ರೂಪಿಸಲಾಗುತ್ತಿದೆ.',
      processing: 'ಧ್ವನಿ ಸಂಸ್ಕರಣೆ...',
      risk: 'ಸಂಭಾವ್ಯ ಸಮಸ್ಯೆ',
      issue: 'ವೈಟ್‌ಫ್ಲೈ ಕೀಟದ ಲಕ್ಷಣ',
      issueDesc: 'ರಸ ಹೀರುವ ಕೀಟದ ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು ಇರಬಹುದು.',
      recommendation: 'ಎಲೆಗಳ ಕೆಳಭಾಗ ಪರಿಶೀಲಿಸಿ; ಕೀಟಗಳು ಕಂಡರೆ ಮಾತ್ರ ನೀಮ್ ಆಧಾರಿತ ಸಿಂಪಡಣೆ ಬಳಸಿ.',
      complete: 'ಸಲಹೆ ಸಿದ್ಧ',
      footer: 'ಧ್ವನಿ ಸಹಾಯಕರ',
      cta: 'ಧ್ವನಿ ಸಹಾಯ ಆರಂಭಿಸಿ'
    },
    scan: {
      header: 'AI ಸ್ಕ್ಯಾನರ್',
      title: 'ಫೋಟೋ ಪರಿಶೀಲನೆ',
      scanning: 'ಪರಿಶೀಲನೆ',
      analyzing: 'ತಪಾಸಣೆ',
      guidance: 'ಸಂಭಾವ್ಯ',
      active: 'ಎಲೆ ಫೋಟೋ ಪರಿಶೀಲನೆ ಸಕ್ರಿಯ',
      checking: 'ಕಲೆಗಳ ಮಾದರಿ ಪರಿಶೀಲನೆ',
      running: 'ಫೋಟೋ ಪರಿಶೀಲನೆ...',
      possibleBox: 'ಸಂಭಾವ್ಯ ಕಲೆ',
      severity: 'ಮಧ್ಯಮ ಅಪಾಯ ಇರಬಹುದು',
      issue: 'ಅರ್ಲಿ ಬ್ಲೈಟ್ ತರಹದ ಕಲೆಗಳು',
      issueDesc: 'ಫೋಟೋ ಲಕ್ಷಣಗಳು ಶಿಲೀಂಧ್ರ ಎಲೆ ಕಲೆಗಳಿಗೆ ಹೋಲಬಹುದು. ಮೇಲಿನಿಂದ ನೀರು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ ಮತ್ತು ಚಿಕಿತ್ಸೆ ಮೊದಲು ದೃಢಪಡಿಸಿ.',
      footer: 'ಫೋಟೋ ಆಧಾರಿತ ಬೆಳೆ ಪರಿಶೀಲನೆ',
      cta: 'ಎಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      alt: 'ಎಲೆ ಸ್ಕ್ಯಾನರ್ ಡೆಮೊ'
    },
    remedy: {
      header: 'AI ಪರಿಹಾರ',
      title: 'ಸ್ಪಷ್ಟ ಕ್ರಮಗಳು',
      compiling: 'ಸಿದ್ಧಪಡುತ್ತಿದೆ',
      alert: 'ಎಚ್ಚರಿಕೆ',
      tasks: ['ಎಲೆಗಳ ಕೆಳಭಾಗ ಪರಿಶೀಲಿಸಿ', 'ಬೇರುಗಳ ಬಳಿ ಮಾತ್ರ ನೀರು ಹಾಕಿ', 'ಬಾಧಿತ ಸಸಿಗಳನ್ನು ಬೇರ್ಪಡಿಸಿ'],
      treatmentReady: 'ಮುಂದಿನ ಹಂತಗಳು ಸಿದ್ಧ',
      serious: 'ಹೆಚ್ಚು ಅಪಾಯ',
      issue: 'ಮೆಣಸಿನಕಾಯಿ ಎಲೆ ಕುರುಚಲು ಲಕ್ಷಣ',
      avoidTitle: 'ಏನು ತಪ್ಪಿಸಬೇಕು',
      avoidOne: 'ದೃಢೀಕರಣವಿಲ್ಲದೆ ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆಯನ್ನು ಹೆಚ್ಚು ಬಳಸಬೇಡಿ.',
      avoidTwo: 'ಕೆಲವು ದಿನಗಳು ಹೆಚ್ಚುವರಿ ನೈಟ್ರೋಜನ್ ಗೊಬ್ಬರ ತಪ್ಪಿಸಿ.',
      critical: 'ಎಚ್ಚರಿಕೆ ಸೂಚನೆ ಸಿದ್ಧ',
      footer: 'ಚಿಕಿತ್ಸೆ ಮಾರ್ಗದರ್ಶಿ',
      cta: 'ನಿರ್ಧಾರ ಆರಂಭಿಸಿ'
    },
    offline: {
      header: 'ಉಳಿಸಿದ ಸಲಹೆಗಳು',
      title: 'ಆಫ್‌ಲೈನ್ ಸಲಹೆ',
      syncing: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ',
      ready: 'ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ',
      saved: 'ಭತ್ತದ ಮಾರ್ಗದರ್ಶಿ ಉಳಿಸಲಾಗಿದೆ',
      syncingText: 'ಆಫ್‌ಲೈನ್ ವೀಕ್ಷಣೆಗೆ ಉಪಯುಕ್ತ ಬೆಳೆ ಸಲಹೆ ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
      synced: 'ಸ್ಥಳೀಯ ಸಲಹೆ ಉಳಿಸಲಾಗಿದೆ',
      lowRisk: 'ಕಡಿಮೆ ಅಪಾಯ',
      issue: 'ಭತ್ತ ಬ್ಲಾಸ್ಟ್ ಗಮನಿಸಿ',
      issueDesc: 'ಹವಾಮಾನ ಅಪಾಯ ಗಮನಿಸಲಾಗಿದೆ. ನೀರಿನ ಮಟ್ಟ ಸ್ಥಿರವಾಗಿರಲಿ ಮತ್ತು ಎಲೆಗಳನ್ನು ಗಮನಿಸಿ.',
      cache: 'ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
      enabled: 'ಆಫ್‌ಲೈನ್ ಪ್ರವೇಶ ಸಕ್ರಿಯ',
      footer: 'ಉಳಿಸಿದ ಬೆಳೆ ಸಲಹೆ',
      cta: 'ಉಳಿಸಿದ ಸಲಹೆ ತೆರೆ'
    }
  },
  hi: {
    eyebrow: 'आवाज पहले | भारत के किसानों के लिए | AI सहायता',
    titleLine: 'अपनी फसल की समस्या बोलें.',
    titleHighlight: 'सरल मार्गदर्शन पाएं.',
    description: 'भाषा चुनें, बोलें या फसल की फोटो अपलोड करें, और सुरक्षित अगले कदम पाएं.',
    speakAction: 'समस्या बोलें',
    cameraAction: 'फोटो लें',
    galleryAction: 'गैलरी अपलोड',
    updatesAction: 'किसान अपडेट',
    trustVoice: 'आवाज सहायता',
    trustLanguage: 'स्थानीय भाषा',
    trustSteps: 'सरल कदम',
    stackHint: 'कार्ड टैप करें या टैब चुनें',
    tabs: ['आवाज', 'फोटो', 'उपाय', 'ऑफलाइन'],
    voice: {
      header: 'AI आवाज',
      title: 'आवाज निदान',
      listening: 'सुन रहा है',
      translating: 'अनुवाद',
      guidance: 'सलाह',
      farmerSpoke: 'किसान ने कहा:',
      sample: 'पत्तियां पीली हो रही हैं और कीट दिख रहे हैं...',
      ready: 'रिकॉर्ड के लिए तैयार',
      parser: 'AI भाषा सहायक',
      translateText: 'किसान की बात को साफ फसल लक्षण नोट में बदला जा रहा है.',
      processing: 'आवाज प्रोसेस हो रही है...',
      risk: 'संभावित समस्या',
      issue: 'व्हाइटफ्लाई कीट लक्षण',
      issueDesc: 'रस चूसने वाले कीट के सामान्य लक्षण हो सकते हैं.',
      recommendation: 'पत्तियों के नीचे जांचें; कीट दिखें तभी नीम आधारित छिड़काव करें.',
      complete: 'सलाह तैयार',
      footer: 'आवाज सहायता',
      cta: 'आवाज सहायता शुरू करें'
    },
    scan: {
      header: 'AI स्कैनर',
      title: 'फोटो जांच',
      scanning: 'जांच',
      analyzing: 'देख रहा है',
      guidance: 'संभावित',
      active: 'पत्ती फोटो जांच सक्रिय',
      checking: 'धब्बों का पैटर्न जांच रहा है',
      running: 'फोटो जांच...',
      possibleBox: 'संभावित धब्बा',
      severity: 'मध्यम जोखिम हो सकता है',
      issue: 'अर्ली ब्लाइट जैसे धब्बे',
      issueDesc: 'फोटो लक्षण फंगल पत्ती धब्बों जैसे हो सकते हैं. ऊपर से पानी न दें और उपचार से पहले पुष्टि करें.',
      footer: 'फोटो आधारित फसल जांच',
      cta: 'पत्ती स्कैन करें',
      alt: 'पत्ती स्कैनर डेमो'
    },
    remedy: {
      header: 'AI उपाय',
      title: 'साफ कार्य योजना',
      compiling: 'तैयार',
      alert: 'सावधानी',
      tasks: ['पत्तियों के नीचे जांचें', 'पानी केवल जड़ों के पास दें', 'प्रभावित पौधों को अलग रखें'],
      treatmentReady: 'अगले कदम तैयार',
      serious: 'अधिक जोखिम',
      issue: 'मिर्च पत्ती मुड़ने के लक्षण',
      avoidTitle: 'क्या न करें',
      avoidOne: 'पुष्टि के बिना रासायनिक स्प्रे अधिक न करें.',
      avoidTwo: 'कुछ दिनों तक अतिरिक्त नाइट्रोजन खाद से बचें.',
      critical: 'सावधानी नोट तैयार',
      footer: 'उपचार गाइड',
      cta: 'निदान शुरू करें'
    },
    offline: {
      header: 'सहेजी सलाह',
      title: 'ऑफलाइन सलाह',
      syncing: 'सहेज रहा है',
      ready: 'ऑफलाइन तैयार',
      saved: 'धान गाइड सहेजी गई',
      syncingText: 'ऑफलाइन देखने के लिए उपयोगी फसल सलाह सहेजी जा रही है...',
      synced: 'स्थानीय सलाह सहेजी गई',
      lowRisk: 'कम जोखिम',
      issue: 'धान ब्लास्ट पर नजर',
      issueDesc: 'मौसम जोखिम दिखा है. पानी का स्तर स्थिर रखें और पत्तियों पर नजर रखें.',
      cache: 'इस डिवाइस में सहेजा गया',
      enabled: 'ऑफलाइन पहुंच चालू',
      footer: 'सहेजी फसल सलाह',
      cta: 'सहेजी सलाह खोलें'
    }
  }
} as const;

type WidenCopy<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenCopy<U>[]
    : { [K in keyof T]: WidenCopy<T[K]> };

type HomeCopy = WidenCopy<(typeof HOME_COPY)['en']>;

// Interactive Card shell matching design screenshot styles
interface InteractiveCardProps {
  children: ReactNode;
}

function InteractiveCard({ children }: InteractiveCardProps) {
  return (
    <div className="relative w-full h-[400px] cursor-pointer select-none group">
      {/* Dynamic tactile shadow under the card */}
      <div className="absolute inset-0 bg-[#ebe9dd] rounded-[28px] -rotate-2 scale-[1.02] transition-transform duration-300 group-hover:scale-[1.03] group-hover:rotate-0 z-0"></div>
      
      <div className="relative w-full h-full z-10 transition-transform duration-300 group-hover:scale-[1.01]">
        {children}
      </div>
    </div>
  );
}

// Custom hook to drive demo step cycling inside each card
function useDemoSequence(numSteps: number, intervalMs: number = 4000, enabled: boolean = true) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % numSteps);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [numSteps, intervalMs, enabled]);

  return enabled ? step : 0;
}

// Simulated animated audio waveform for Voice Input Demo (Pure & Deterministic)
const WaveformBarsDemo = ({ reduceMotion = false }: { reduceMotion?: boolean }) => {
  if (reduceMotion) {
    return (
      <div className="flex justify-center items-center gap-1.5 h-12 mt-2">
        {[14, 26, 18, 34, 20, 28, 16].map((height, index) => (
          <div
            key={index}
            style={{ height }}
            className="w-1.5 bg-[var(--brand-primary)] rounded-full"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-1.5 h-12 mt-2">
      {[1, 2, 3, 4, 5, 6, 7].map((bar) => {
        const seedDelay = Math.abs(Math.sin(bar)) * 1000;
        const seedDuration = Math.abs(Math.cos(bar)) * 1000;
        const randomDelay = (seedDelay - Math.floor(seedDelay)) * 0.4;
        const randomDuration = 0.6 + (seedDuration - Math.floor(seedDuration)) * 0.6;
        return (
          <motion.div
            key={bar}
            animate={{
              height: [8, 36, 12, 40, 8],
            }}
            transition={{
              repeat: Infinity,
              duration: randomDuration,
              delay: randomDelay,
              ease: "easeInOut",
            }}
            className="w-1.5 bg-[var(--brand-primary)] rounded-full"
          />
        );
      })}
    </div>
  );
};

// 1. VOICE DIAGNOSIS FRONT (Cycles: Listening -> Translating -> Diagnosis Complete)
const VoiceCardDemo = ({ onStart, copy, reduceMotion }: { onStart: () => void; copy: HomeCopy['voice']; reduceMotion: boolean }) => {
  const step = useDemoSequence(3, 4000, !reduceMotion);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <Mic className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">{copy.header}</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">{copy.title}</p>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="badge-listening"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold tracking-wider animate-pulse"
            >
              {copy.listening}
            </motion.div>
          )}
          {step === 1 && (
            <motion.div 
              key="badge-translating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold tracking-wider"
            >
              {copy.translating}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div 
              key="badge-resolved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-[#f0faf4] border border-[#cbebd6] text-[#1E6B4B] text-[10px] font-bold tracking-wider"
            >
              {copy.guidance}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Box */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF9F5] rounded-[24px] border border-[#efede6] my-3 sm:my-4 overflow-hidden min-h-[160px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="voice-step-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center justify-center gap-4"
            >
              <WaveformBarsDemo reduceMotion={reduceMotion} />
              <div className="text-center">
                <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider mb-1">{copy.farmerSpoke}</p>
                <p className="text-xs text-[#1E6B4B] font-extrabold italic leading-relaxed">{copy.sample}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Sparkles className="w-4 h-4 text-[#1E6B4B] fill-[#1E6B4B] animate-pulse" />
                <span className="text-[#123C2C] text-[10px] font-bold uppercase tracking-wider">{copy.ready}</span>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="voice-step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center justify-center gap-3 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
              >
                <RefreshCw className="w-9 h-9 text-blue-600" />
              </motion.div>
              <div className="px-4">
                <p className="text-[9px] text-[#7C8B80] font-bold uppercase tracking-wider mb-1">{copy.parser}</p>
                <p className="text-xs text-[#5d665f] font-semibold">{copy.translateText}</p>
              </div>
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">{copy.processing}</span>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="voice-step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-start justify-center gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase border border-amber-200">{copy.risk}</span>
                <h4 className="font-extrabold text-sm text-[#17231B]">{copy.issue}</h4>
              </div>
              <p className="text-xs text-[#5d665f] font-semibold leading-relaxed">{copy.issueDesc}</p>
              
              <div className="bg-white p-2.5 rounded-xl border border-[#efede6] shadow-sm w-full mt-1.5 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1E6B4B] mt-1.5 flex-shrink-0" />
                <p className="text-[10px] text-[#123C2C] font-extrabold leading-normal">{copy.recommendation}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2 justify-center w-full">
                <Sparkles className="w-3.5 h-3.5 text-[#1E6B4B] fill-[#1E6B4B]" />
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">{copy.complete}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>{copy.footer}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>{copy.cta}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 2. VISUAL PHOTO SCANNER FRONT (Cycles: Scanning -> Analyzing spots -> Real-time Output query result)
const ScanCardDemo = ({ onStart, copy, reduceMotion }: { onStart: () => void; copy: HomeCopy['scan']; reduceMotion: boolean }) => {
  const step = useDemoSequence(3, 4000, !reduceMotion);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <Camera className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">{copy.header}</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">{copy.title}</p>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="badge-scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-[#f0faf4] border border-[#cbebd6] text-[#1E6B4B] text-[10px] font-bold tracking-wider animate-pulse"
            >
              {copy.scanning}
            </motion.div>
          )}
          {step === 1 && (
            <motion.div 
              key="badge-analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold tracking-wider"
            >
              {copy.analyzing}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div 
              key="badge-resolved-scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold tracking-wider"
            >
              {copy.guidance}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Box */}
      <div className="relative flex-1 flex flex-col p-3 sm:p-4 bg-[#FAF9F5] rounded-[24px] border border-[#efede6] my-3 sm:my-4 overflow-hidden min-h-[160px] justify-between">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="scan-step-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col relative"
            >
              {/* Leaf Photo Container */}
              <div className="relative w-full h-[110px] md:h-[140px] rounded-[18px] overflow-hidden border border-[#efede6] bg-[#efede6]">
                <Image src="/tomato_leaf.png" fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover select-none pointer-events-none" alt={copy.alt} />
                
                {/* Animated Scanning Laser Line */}
                <div className="absolute left-0 w-full h-[3px] bg-emerald-500 opacity-80 shadow-[0_0_12px_#1E6B4B] animate-scan z-20" />
                
                {/* Pulsing Target Crosshairs */}
                <div className="absolute top-[35%] left-[45%] w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                  <span className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full border border-white" />
                </div>
                <div className="absolute top-[60%] left-[30%] w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                  <span className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full border border-white" />
                </div>
                <div className="absolute top-[50%] left-[70%] w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                  <span className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full border border-white" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3.5 justify-center">
                <Sparkles className="w-4 h-4 text-[#1E6B4B] fill-[#1E6B4B] animate-pulse" />
                <span className="text-[#123C2C] text-[10px] font-bold uppercase tracking-wider">{copy.active}</span>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="scan-step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col relative"
            >
              {/* Leaf Photo Container with Analysis Overlay */}
              <div className="relative w-full h-[110px] md:h-[140px] rounded-[18px] overflow-hidden border border-[#efede6] bg-[#efede6]">
                <Image src="/tomato_leaf.png" fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover select-none pointer-events-none brightness-90" alt={copy.alt} />
                <div className="absolute inset-0 bg-blue-900/10 z-10" />

                {/* Concentric Expanding Checking Circles */}
                <div className="absolute top-[35%] left-[45%] w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-0 border border-blue-400 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 border border-blue-300 rounded-full"
                  />
                </div>
                <div className="absolute top-[60%] left-[30%] w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                    className="absolute inset-0 border border-blue-400 rounded-full"
                  />
                </div>
              </div>

              <div className="w-full mt-3 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#7C8B80] uppercase tracking-wider">
                  <span>{copy.checking}</span>
                  <span className="text-blue-700 animate-pulse">{copy.running}</span>
                </div>
                <div className="h-1 bg-gray-200/80 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '100%' }} 
                    transition={{ duration: 4, ease: 'linear' }} 
                    className="h-full bg-blue-600 rounded-full" 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="scan-step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col relative"
            >
              {/* Leaf Photo Container with Diagnosis Highlights */}
              <div className="relative w-full h-[110px] md:h-[140px] rounded-[18px] overflow-hidden border border-[#efede6] bg-[#efede6]">
                <Image src="/tomato_leaf.png" fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover select-none pointer-events-none" alt={copy.alt} />
                
                {/* Bounding Box for infected area */}
                <div className="absolute top-[20%] left-[22%] w-[58%] h-[55%] border-2 border-amber-500 rounded-lg shadow-[0_0_8px_rgba(245,158,11,0.5)] z-20">
                  <span className="absolute top-0 left-0 bg-amber-500 text-white font-black text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-br-md select-none">
                    {copy.possibleBox}
                  </span>
                </div>
              </div>

              <div className="w-full mt-2.5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-[var(--status-serious)] text-[8px] font-extrabold uppercase border border-red-200">{copy.severity}</span>
                  <h4 className="font-extrabold text-[11px] text-[#17231B]">{copy.issue}</h4>
                </div>
                <p className="text-[10px] text-[#5d665f] font-semibold leading-relaxed">{copy.issueDesc}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>{copy.footer}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>{copy.cta}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 3. ACTION PLANS FRONT (Cycles: Compiling lists -> Action Warning output)
const RemedyCardDemo = ({ onStart, copy, reduceMotion }: { onStart: () => void; copy: HomeCopy['remedy']; reduceMotion: boolean }) => {
  const step = useDemoSequence(2, 4500, !reduceMotion);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">{copy.header}</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">{copy.title}</p>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="badge-compiling"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold tracking-wider animate-pulse"
            >
              {copy.compiling}
            </motion.div>
          )}
          {step === 1 && (
            <motion.div 
              key="badge-alert"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold tracking-wider"
            >
              {copy.alert}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Box */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF9F5] rounded-[24px] border border-[#efede6] my-3 sm:my-4 overflow-hidden min-h-[160px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="remedy-step-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col gap-2.5"
            >
              {[
                { text: copy.tasks[0], checked: true },
                { text: copy.tasks[1], checked: true },
                { text: copy.tasks[2], checked: false }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-[#efede6] shadow-sm"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${item.checked ? 'border-[#1E6B4B] bg-[#1E6B4B]/10 text-[#1E6B4B]' : 'border-gray-300'}`}>
                    {item.checked && <Check className="w-3 h-3 stroke-[3.5]" />}
                  </div>
                  <span className="text-[11px] font-bold text-[#5d665f]">{item.text}</span>
                </div>
              ))}
              
              <div className="flex items-center gap-1.5 mt-2 justify-center w-full">
                <Sparkles className="w-3.5 h-3.5 text-[#1E6B4B] fill-[#1E6B4B] animate-pulse" />
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">{copy.treatmentReady}</span>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="remedy-step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-start gap-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[9px] font-extrabold uppercase border border-red-200">{copy.serious}</span>
                <h4 className="font-extrabold text-sm text-[#17231B]">{copy.issue}</h4>
              </div>
              
              <div className="bg-red-50/40 rounded-[18px] p-3 border border-red-100 w-full flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-[10px] uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>{copy.avoidTitle}</span>
                </div>
                <ul className="text-[10px] text-red-950 space-y-1.5 font-semibold mt-1">
                  <li className="flex items-start gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    {copy.avoidOne}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    {copy.avoidTwo}
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-1.5 mt-1 justify-center w-full">
                <Sparkles className="w-3 h-3 text-red-700 fill-red-700" />
                <span className="text-red-900 text-[9px] font-bold uppercase tracking-wider">{copy.critical}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>{copy.footer}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>{copy.cta}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 4. SAVED OFFLINE GUIDES FRONT (Cycles: Syncing Cloud -> Offline Access Guides Stored)
const OfflineCardDemo = ({ onNavigate, copy, reduceMotion }: { onNavigate?: (screen: any) => void; copy: HomeCopy['offline']; reduceMotion: boolean }) => {
  const step = useDemoSequence(2, 4500, !reduceMotion);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <Bookmark className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">{copy.header}</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">{copy.title}</p>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="badge-syncing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold tracking-wider animate-pulse"
            >
              {copy.syncing}
            </motion.div>
          )}
          {step === 1 && (
            <motion.div 
              key="badge-ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-[#f0faf4] border border-[#cbebd6] text-[#1E6B4B] text-[10px] font-bold tracking-wider"
            >
              {copy.ready}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Box */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF9F5] rounded-[24px] border border-[#efede6] my-3 sm:my-4 overflow-hidden min-h-[160px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="offline-step-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center justify-center gap-2 text-center"
            >
              <WifiOff className="w-10 h-10 text-[#1E6B4B] mb-2 animate-bounce" />
              <div className="text-center px-4">
                <p className="text-xs font-extrabold text-[#123C2C]">{copy.saved}</p>
                <p className="text-[10px] text-[#5d665f] mt-1 font-semibold">{copy.syncingText}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2 justify-center w-full">
                <Sparkles className="w-3.5 h-3.5 text-[#1E6B4B] fill-[#1E6B4B] animate-pulse" />
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">{copy.synced}</span>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="offline-step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex flex-col items-start gap-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase border border-emerald-200">{copy.lowRisk}</span>
                <h4 className="font-extrabold text-sm text-[#17231B]">{copy.issue}</h4>
              </div>
              <p className="text-xs text-[#5d665f] font-semibold leading-relaxed">{copy.issueDesc}</p>
              
              <div className="bg-[#FAF9F5] rounded-[18px] p-2.5 border border-[#efede6] w-full flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide">{copy.cache}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 justify-center w-full">
                <Sparkles className="w-3 h-3 text-[#1E6B4B] fill-[#1E6B4B]" />
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">{copy.enabled}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>{copy.footer}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.('saved');
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>{copy.cta}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export function HomeScreen({ 
  onStart, 
  onUpdates, 
  onNavigate,
  onStartUpload,
  language = 'en'
}: { 
  onStart: () => void; 
  onUpdates: () => void; 
  onNavigate?: (screen: any) => void;
  onStartUpload?: (source: UploadSource) => void;
  language?: string;
}) {
  const lang = (language === 'kn' || language === 'hi' || language === 'en' ? language : 'en') as Language;
  const t = UI_STRINGS[lang] || UI_STRINGS.en;
  const [selectedFeature, setSelectedFeature] = useState<number>(0);
  const reduceMotion = Boolean(useReducedMotion());
  const homeCopy = HOME_COPY[lang];
  const handleUploadStart = (source: UploadSource) => {
    if (onStartUpload) {
      onStartUpload(source);
      return;
    }

    onStart();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full flex flex-col mt-4 md:mt-8 pb-16"
    >
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-10 items-center justify-between w-full">
        {/* Left Column: Hero Text */}
        <div className="w-full lg:max-w-[55%] flex flex-col items-start">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--brand-light)] border border-[var(--brand-primary)]/10 text-[var(--brand-deep)] font-semibold text-xs mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
            {homeCopy.eyebrow}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight tracking-tight mb-6">
            {homeCopy.titleLine} <br className="hidden md:block"/>
            <span className="text-[var(--brand-primary)]">{homeCopy.titleHighlight}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 leading-relaxed max-w-lg font-medium">
            {homeCopy.description}
          </p>
          
          <div className="grid grid-cols-1 min-[460px]:grid-cols-3 gap-3 w-full mb-4">
            <button
              onClick={onStart}
              className="justify-center bg-[var(--brand-primary)] text-white px-5 py-4 rounded-[var(--radius-lg)] font-bold text-base flex items-center gap-2 hover:bg-[var(--brand-deep)] transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Mic className="w-5 h-5" />
              {homeCopy.speakAction}
            </button>

            <button
              onClick={() => handleUploadStart('camera')}
              className="justify-center bg-white border border-[var(--border-subtle)] text-[var(--text-primary)] px-5 py-4 rounded-[var(--radius-lg)] font-bold text-base flex items-center gap-2 hover:bg-[var(--surface-soft)] transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <Camera className="w-5 h-5 text-[var(--brand-primary)]" />
              {homeCopy.cameraAction}
            </button>

            <button 
              onClick={() => handleUploadStart('gallery')}
              className="justify-center bg-white border border-[var(--border-subtle)] text-[var(--text-primary)] px-5 py-4 rounded-[var(--radius-lg)] font-bold text-base flex items-center gap-2 hover:bg-[var(--surface-soft)] transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <ImageIcon className="w-5 h-5 text-[var(--brand-primary)]" />
              {homeCopy.galleryAction}
            </button>
          </div>

          <button
            onClick={onUpdates}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-fit mb-8 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white px-5 py-3 text-sm font-extrabold text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors shadow-sm active:scale-[0.98]"
          >
            {homeCopy.updatesAction}
            <ChevronRight className="w-4 h-4 text-[var(--brand-primary)]" />
          </button>

          <div className="flex flex-row justify-between sm:justify-start sm:gap-6 text-[10px] min-[360px]:text-xs sm:text-sm text-[var(--text-secondary)] font-bold w-full mb-6 flex-nowrap">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-primary)] flex-shrink-0" /> {homeCopy.trustVoice}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-primary)] flex-shrink-0" /> {homeCopy.trustLanguage}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-primary)] flex-shrink-0" /> {homeCopy.trustSteps}
            </div>
          </div>

          <WeatherWidget language={language} />
          
          {/* Local KVK Finder Card */}
          <div className="w-full bg-white rounded-[28px] border border-[#efebe0] p-6 shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)] mt-6 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm flex-shrink-0">
                <MapPin className="w-6 h-6 text-[#1E6B4B]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">{t.kvkCardTitleHeader || 'EXPERT SUPPORT'}</p>
                <h4 className="font-extrabold text-lg text-[#17231B] leading-tight mt-0.5">
                  {t.kvkCardTitle || 'Connect with Local Experts (KVK)'}
                </h4>
                <p className="text-xs text-[#5d665f] font-semibold leading-relaxed mt-2">
                  {t.kvkCardDesc || 'Find your nearest Krishi Vigyan Kendra (Agricultural Science Center) for personalized crop guidance, soil testing, and official seeds.'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate?.('kvk')}
              className="w-full mt-5 py-3.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-deep)] text-white text-sm font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{t.kvkCardBtn || 'Find KVK Centers'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: React Bits Stack Component (Single Sided Cards with swipe-on-tap) */}
        <div className="w-full lg:max-w-[40%] relative mt-8 lg:mt-0 flex-shrink-0 select-none">
          <div className="h-[400px] sm:h-[420px] relative">
            <Stack
              activeIndex={selectedFeature}
              onCardChange={(index) => {
                setSelectedFeature(index);
              }}
              autoplay={false}
              autoplayDelay={4000}
              mobileClickOnly={true}
              cards={[
                <InteractiveCard key={0}>
                  <VoiceCardDemo onStart={onStart} copy={homeCopy.voice} reduceMotion={reduceMotion} />
                </InteractiveCard>,
                <InteractiveCard key={1}>
                  <ScanCardDemo onStart={onStart} copy={homeCopy.scan} reduceMotion={reduceMotion} />
                </InteractiveCard>,
                <InteractiveCard key={2}>
                  <RemedyCardDemo onStart={onStart} copy={homeCopy.remedy} reduceMotion={reduceMotion} />
                </InteractiveCard>,
                <InteractiveCard key={3}>
                  <OfflineCardDemo onNavigate={onNavigate} copy={homeCopy.offline} reduceMotion={reduceMotion} />
                </InteractiveCard>
              ]}
            />
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C8B80] text-center mb-2">
              {homeCopy.stackHint}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {homeCopy.tabs.map((label, index) => {
                const isActive = selectedFeature === index;
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedFeature(index)}
                    className={`h-10 rounded-xl border px-2 text-[11px] font-extrabold transition-colors ${
                      isActive
                        ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm'
                        : 'bg-white text-[var(--text-secondary)] border-[#efede6] hover:bg-[var(--surface-soft)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

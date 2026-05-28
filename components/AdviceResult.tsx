import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Volume2, VolumeX, Copy, Bookmark, Printer, ShieldAlert, Sparkles, Download, Share2, ShieldCheck } from 'lucide-react';
import { AdvisoryResult } from '@/lib/types';
import { UI_STRINGS, CROP_TRANSLATIONS, Language, getLocalizedCropName } from '@/lib/translations';

function getFormattedDate(dateString?: string) {
  return new Date(dateString || Date.now()).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const PROGRESSION_TEXTS = {
  en: {
    early: "Early spots visible. High treatment success rate. Action recommended now.",
    mid: "Spreading lesions. Leaf function starts declining. Intermediate hazard.",
    late: "Severe necrosis. High risk of complete leaf drop and yield loss. Critical alert!"
  },
  kn: {
    early: "ಆರಂಭಿಕ ಚುಕ್ಕೆಗಳು ಗೋಚರಿಸುತ್ತವೆ. ಚಿಕಿತ್ಸೆಯ ಯಶಸ್ಸಿನ ಪ್ರಮಾಣ ಹೆಚ್ಚು. ಈಗಲೇ ಚಿಕಿತ್ಸೆ ನೀಡಿ.",
    mid: "ಹರಡುತ್ತಿರುವ ಮಚ್ಚೆಗಳು. ಎಲೆಯ ಚಟುವಟಿಕೆ ಕ್ಷೀಣಿಸುತ್ತದೆ. ಮಧ್ಯಮ ಅಪಾಯ.",
    late: "ತೀವ್ರ ಹಾನಿ. ಎಲೆಗಳು ಉದುರುವ ಅಪಾಯ ಮತ್ತು ಇಳುವರಿ ನಷ್ಟ. ತುರ್ತು ಚಿಕಿತ್ಸೆ ಅಗತ್ಯ!"
  },
  hi: {
    early: "शुरुआती धब्बे दिखाई दे रहे हैं। उपचार की सफलता दर उच्च है। तुरंत कार्रवाई करें।",
    mid: "फैलते हुए धब्बे। पत्ती की कार्यक्षमता कम होने लगती है। मध्यम खतरा।",
    late: "गंभीर क्षति। पत्ती गिरने और उपज हानि का उच्च जोखिम। तत्काल उपचार आवश्यक!"
  }
};

export function AdviceResult({ 
  result, 
  onBack, 
  onSave, 
  showToast 
}: { 
  result: AdvisoryResult; 
  onBack: () => void; 
  onSave: () => void; 
  showToast: (msg: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [day, setDay] = useState(1);
  const [speechRate, setSpeechRate] = useState<number>(0.85); // Default to slightly slower, clearer speech for farmers
  const [activeTab, setActiveTab] = useState<'organic' | 'chemical'>('organic');
  const lang = (result.language as Language) || 'en';
  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startSpeaking = (rate: number) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    let whatToDoLabel = "What to do now";
    let whatToAvoidLabel = "What to avoid";
    if (lang === 'kn') {
      whatToDoLabel = "ಈಗ ಏನು ಮಾಡಬೇಕು";
      whatToAvoidLabel = "ಏನು ತಪ್ಪಿಸಬೇಕು";
    } else if (lang === 'hi') {
      whatToDoLabel = "अभी क्या करें";
      whatToAvoidLabel = "क्या न करें";
    }

    const textToRead = `${result.problemSummary}. ${whatToDoLabel}. ${result.doNow?.join('. ')}. ${whatToAvoidLabel}. ${result.avoid?.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate;
    
    let langCode = 'en-IN';
    if (lang === 'kn') langCode = 'kn-IN';
    if (lang === 'hi') langCode = 'hi-IN';
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.replace('_', '-').startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const togglePlayback = () => {
    if (!window.speechSynthesis) {
      showToast(lang === 'kn' ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಬೆಂಬಲವಿಲ್ಲ." : lang === 'hi' ? "इस ब्राउज़र में बोलने की सुविधा नहीं है।" : "Text-to-speech is not supported on this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      startSpeaking(speechRate);
    }
  };
  
  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(result.whatsappMessage);
      showToast(t.copiedMsg || "WhatsApp message copied!");
    } else {
      showToast(lang === 'kn' ? "ಕಾಪಿ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" : lang === 'hi' ? "कॉपी करना संभव नहीं है" : "Copying not supported on this device.");
    }
  };

  const severityColors = {
    Low: 'bg-[var(--status-low)]/10 text-[var(--status-low)] border-[var(--status-low)]/20',
    Medium: 'bg-[var(--status-medium)]/10 text-[var(--status-medium)] border-[var(--status-medium)]/20',
    Serious: 'bg-[var(--status-serious)]/10 text-[var(--status-serious)] border-[var(--status-serious)]/20',
  };



  const getCropEmoji = (cropName: string) => {
    if (!cropName) return '🌱';
    const name = cropName.toLowerCase();
    if (name.includes('tomato')) return '🍅';
    if (name.includes('paddy') || name.includes('rice') || name.includes('धान') || name.includes('ಭತ್ತ')) return '🌾';
    if (name.includes('ragi') || name.includes('ರಾಗಿ') || name.includes('ರಾಕಿ') || name.includes('ರಾ ಗಿ') || name.includes('ರಾ ಜಿ') || name.includes('ರಾ ಗಿ') || name.includes('ರಾ ಜಿ') || name.includes('ರಾಕಿ') || name.includes('ರಾಗಿ') || name.includes('ರಾಗಿ') || name.includes('रागी')) return '🌿';
    if (name.includes('chilli') || name.includes('pepper') || name.includes('ಮೆಣಸಿನಕಾಯಿ') || name.includes('मिर्च')) return '🌶';
    if (name.includes('maize') || name.includes('corn') || name.includes('ಮೆಕ್ಕೆಜೋಳ') || name.includes('मक्का')) return '🌽';
    if (name.includes('lemon') || name.includes('citrus') || name.includes('lime') || name.includes('ನಿಂಬೆ') || name.includes('नींबू')) return '🍋';
    if (name.includes('mango') || name.includes('ಮಾವು') || name.includes('आम')) return '🥭';
    if (name.includes('cotton') || name.includes('ಹತ್ತಿ') || name.includes('कपास')) return '☁️';
    if (name.includes('groundnut') || name.includes('peanut') || name.includes('ನೆಲಗಡಲೆ') || name.includes('ಶೇಂಗಾ') || name.includes('मूंगफली')) return '🥜';
    if (name.includes('banana') || name.includes('ಬಾಳೆ') || name.includes('केला')) return '🍌';
    if (name.includes('onion') || name.includes('ಈರುಳ್ಳಿ') || name.includes('प्याज')) return '🧅';
    if (name.includes('potato') || name.includes('ಆಲೂಗಡ್ಡೆ') || name.includes('आलू')) return '🥔';
    if (name.includes('garlic') || name.includes('ಬೆಳ್ಳುಳ್ಳಿ') || name.includes('लहसुन')) return '🧄';
    if (name.includes('ginger') || name.includes('ಶುಂಠಿ') || name.includes('ಅದರಕ್') || name.includes('अदरक')) return '🫚';
    if (name.includes('brinjal') || name.includes('eggplant') || name.includes('ಬದನೆಕಾಯಿ') || name.includes('बैंगन')) return '🍆';
    if (name.includes('wheat') || name.includes('ಗೋಧಿ') || name.includes('गेहूं')) return '🌾';
    if (name.includes('coconut') || name.includes('ತೆಂಗಿನಕಾಯಿ') || name.includes('ನಾರಿಯಲ್') || name.includes('नारियल')) return '🥥';
    if (name.includes('arecanut') || name.includes('ಅಡಿಕೆ') || name.includes('सुपारी')) return '🌴';
    return '🌱';
  };

  const severityLabels: Record<Language, Record<string, string>> = {
    en: { Low: 'Low Severity', Medium: 'Medium Severity', Serious: 'Serious Severity' },
    kn: { Low: 'ಕಡಿಮೆ ತೀವ್ರತೆ', Medium: 'ಮಧ್ಯಮ ತೀವ್ರತೆ', Serious: 'ತೀವ್ರ ಅಪಾಯ' },
    hi: { Low: 'कम गंभीरता', Medium: 'मध्यम गंभीरता', Serious: 'गंभीर जोखिम' }
  };

  const chemicalKeywords = [
    'spray', 'chemical', 'fungicide', 'pesticide', 'copper', 'sulfur', 'urea', 'nitrogen', 'NPK', 'fertilizer', 'streptocycline', 'mancozeb', 'chlorpyrifos', 'imidacloprid',
    'ರಾಸಾಯನಿಕ', 'ಔಷಧಿ', 'ಸಿಂಪಡಿಸಿ', 'ರಸಗೊಬ್ಬರ', 'ಕೀಟನಾಶಕ', 'ರೋಗನಾಶಕ', 'ಕೊಡ್ರಿ', 'ಸಲ್ಫೇಟ್', 'ಸಲ್ಫರ್', 'ತಾಮ್ರ', 'ಮ್ಯಾಂಕೋಜೆಬ್', 'ಯೂರಿಯಾ',
    'रासायनिक', 'कीटनाशक', 'उर्वरक', 'दवा', 'छिड़काव', 'कॉपर', 'सल्फर', 'यूरिया', 'नाइट्रोजन', 'फंगीसाइड', 'कीट नाशक'
  ];

  const isChemicalString = (str: string) => {
    const s = str.toLowerCase();
    return chemicalKeywords.some(kw => s.includes(kw));
  };

  // Filter advice lists dynamically
  const organicDoNow = result.doNow?.filter(item => !isChemicalString(item)) || [];
  const chemicalDoNow = result.doNow?.filter(item => isChemicalString(item)) || [];

  const organicAvoid = result.avoid?.filter(item => !isChemicalString(item)) || [];
  const chemicalAvoid = result.avoid?.filter(item => isChemicalString(item)) || [];

  // Canvas card generator for WhatsApp sharing
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;

    // Dynamically calculate canvas height based on content to prevent overlaps
    const remediesToDraw = organicDoNow.length > 0 ? organicDoNow.slice(0, 3) : result.doNow.slice(0, 3);
    const charPerLine = lang === 'en' ? 55 : 45; // Local scripts are wider
    const summaryLines = Math.ceil(result.problemSummary.length / charPerLine) || 1;
    
    let remediesLines = 0;
    remediesToDraw.forEach(item => {
      remediesLines += Math.ceil(item.length / charPerLine) || 1;
    });
    
    const headerHeight = 220;
    const summaryHeight = summaryLines * 45;
    const imageHeight = result.image ? 320 : 0;
    const remediesTitleHeight = 55;
    const remediesHeight = (remediesLines * 28) + (remediesToDraw.length * 45);
    const footerHeight = 160;
    
    const totalHeight = headerHeight + summaryHeight + imageHeight + remediesTitleHeight + remediesHeight + footerHeight;
    canvas.height = Math.max(1000, Math.round(totalHeight));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient (Tactile Slate Green)
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#123C2C');
    grad.addColorStop(1, '#081D15');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, canvas.height);

    // Inner Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 15;
    ctx.strokeRect(30, 30, 740, canvas.height - 60);

    // Title Header
    ctx.fillStyle = '#A7F3D0';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('FORKISAN AI CROP ADVISORY', 60, 95);

    // Date
    ctx.fillStyle = '#6EE7B7';
    ctx.font = 'bold 20px sans-serif';
    const formattedDate = getFormattedDate(result.date);
    ctx.fillText(formattedDate, 600, 95);

    // Crop Header Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(60, 130, 680, 80, 16);
    ctx.fill();

    // Crop Emoji & Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${getCropEmoji(result.crop)} ${getLocalizedCropName(result.crop, lang)}`, 80, 182);

    // Severity Badge
    const badgeColor = result.severity === 'Serious' ? '#EF4444' : result.severity === 'Medium' ? '#F59E0B' : '#10B981';
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(500, 145, 210, 50, 12);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(severityLabels[lang]?.[result.severity]?.toUpperCase() || result.severity.toUpperCase(), 605, 177);
    ctx.textAlign = 'left';

    // Diagnosis Summary
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    const summaryWords = result.problemSummary.split(' ');
    let summaryLine = '';
    let summaryY = 270;
    for (let n = 0; n < summaryWords.length; n++) {
      let testLine = summaryLine + summaryWords[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > 680 && n > 0) {
        ctx.fillText(summaryLine, 60, summaryY);
        summaryLine = summaryWords[n] + ' ';
        summaryY += 45;
      } else {
        summaryLine = testLine;
      }
    }
    ctx.fillText(summaryLine, 60, summaryY);

    const drawRemedies = (hasImage: boolean, imgElement?: HTMLImageElement) => {
      let listStartY = summaryY + 55;

      if (hasImage && imgElement) {
        const frameX = 60;
        const frameY = listStartY;
        const frameW = 680;
        const frameH = 280;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameW, frameH, 20);
        ctx.fill();

        // Fit image
        const aspect = imgElement.width / imgElement.height;
        let dw = frameW;
        let dh = frameW / aspect;
        if (dh > frameH) {
          dh = frameH;
          dw = frameH * aspect;
        }
        const dx = frameX + (frameW - dw) / 2;
        const dy = frameY + (frameH - dh) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameW, frameH, 20);
        ctx.clip();
        ctx.drawImage(imgElement, dx, dy, dw, dh);
        ctx.restore();

        listStartY += 320;
      }

      // Title Remedies
      ctx.fillStyle = '#34D399';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(t.organicTab?.toUpperCase() || 'RECOMMENDED ADVISORY STEPS:', 60, listStartY);

      ctx.fillStyle = '#E8F5EE';
      ctx.font = 'normal 20px sans-serif';
      let adviceY = listStartY + 45;

      // Filter or slice to top 3 remedies to fit card safely
      const remediesToDraw = organicDoNow.length > 0 ? organicDoNow.slice(0, 3) : result.doNow.slice(0, 3);
      remediesToDraw.forEach((item, index) => {
        const num = `${index + 1}. `;
        ctx.fillStyle = '#6EE7B7';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(num, 60, adviceY);

        ctx.fillStyle = '#E8F5EE';
        ctx.font = 'normal 20px sans-serif';
        const itemWords = item.split(' ');
        let itemLine = '';
        for (let n = 0; n < itemWords.length; n++) {
          let testLine = itemLine + itemWords[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > 630 && n > 0) {
            ctx.fillText(itemLine, 90, adviceY);
            itemLine = itemWords[n] + ' ';
            adviceY += 28;
          } else {
            itemLine = testLine;
          }
        }
        ctx.fillText(itemLine, 90, adviceY);
        adviceY += 45;
      });

      // Bottom Divider
      const dividerY = adviceY + 15;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, dividerY);
      ctx.lineTo(740, dividerY);
      ctx.stroke();

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#A7F3D0';
      ctx.font = 'italic 15px sans-serif';
      const discText = t.disclaimer || 'This is AI guidance. Consult KVK before chemical treatment.';
      const discWords = discText.split(' ');
      let discLine = '';
      let discY = dividerY + 35;
      for (let n = 0; n < discWords.length; n++) {
        let testLine = discLine + discWords[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > 650 && n > 0) {
          ctx.fillText(discLine, 400, discY);
          discLine = discWords[n] + ' ';
          discY += 20;
        } else {
          discLine = testLine;
        }
      }
      ctx.fillText(discLine, 400, discY);

      // Download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `forkisan-advisory-${result.crop}-${Date.now()}.png`;
      link.href = url;
      link.click();
      showToast(lang === 'kn' ? 'ಹಂಚಿಕೆ ಕಾರ್ಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!' : lang === 'hi' ? 'शेयर कार्ड डाउनलोड हो गया है!' : 'Advisory share card downloaded!');
    };

    if (result.image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawRemedies(true, img);
      img.onerror = () => drawRemedies(false);
      img.src = result.image;
    } else {
      drawRemedies(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto flex flex-col pt-2 pb-10"
    >
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">{t.back || 'Back'}</span>
        </button>
        <div className="flex gap-2">
          <button onClick={onSave} className="p-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-soft)] rounded-full transition-colors" aria-label={t.saveBtn || "Save Advice"}>
            <Bookmark className="w-5 h-5" />
          </button>
          <button onClick={() => window.print()} className="p-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-soft)] rounded-full transition-colors hidden sm:block" aria-label={t.printBtn || "Print Advice"}>
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Summary Header Card */}
        <motion.div variants={staggerItem} className="bg-white rounded-[var(--radius-xl)] p-6 border border-[var(--border-subtle)] shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                {t.crop || 'Crop'}: {getLocalizedCropName(result.crop, lang)}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug">{result.problemSummary}</h2>
            </div>
            <div className={`px-3 py-1.5 rounded-md border text-sm font-bold tracking-wide uppercase ${severityColors[result.severity]}`}>
              {severityLabels[lang]?.[result.severity] || `${result.severity} Issue`}
            </div>
          </div>
        </motion.div>

        {/* Interactive Disease Progression Card */}
        <motion.div variants={staggerItem} className="bg-white rounded-[var(--radius-xl)] p-5 border border-[var(--border-subtle)] shadow-sm flex flex-col md:flex-row gap-6 items-center">
          {/* Morphing Leaf SVG Graphic */}
          <div className="relative w-36 h-36 flex items-center justify-center bg-[#FAF9F5] border border-[#efede6] rounded-2xl flex-shrink-0 shadow-inner">
            <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-12">
              <defs>
                {/* Leaf Base Gradient */}
                <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={day < 4 ? '#15803d' : day < 7 ? '#854d0e' : '#78350f'} className="transition-colors duration-500" />
                  <stop offset="50%" stopColor={day < 4 ? '#22c55e' : day < 7 ? '#eab308' : '#854d0e'} className="transition-colors duration-500" />
                  <stop offset="100%" stopColor={day < 4 ? '#86efac' : day < 7 ? '#fef08a' : '#ca8a04'} className="transition-colors duration-500" />
                </linearGradient>
                
                {/* Fungal Spot Radials */}
                <radialGradient id="spotGrad">
                  <stop offset="0%" stopColor="#1e0b00" />
                  <stop offset="45%" stopColor="#451a03" stopOpacity="0.9" />
                  <stop offset="80%" stopColor="#ca8a04" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Healthy/Infected Leaf Base Shape */}
              <path 
                d="M15,85 C25,60 40,30 85,15 C70,45 60,75 15,85 Z" 
                fill="url(#leafGrad)"
                stroke={day < 7 ? '#1e6b4b' : '#5c3818'} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="transition-colors duration-500"
              />
              
              {/* Veins */}
              {/* Midrib */}
              <path 
                d="M15,85 Q45,55 85,15" 
                stroke={day < 7 ? '#14532d' : '#451a03'} 
                strokeWidth="2" 
                fill="none"
                strokeLinecap="round" 
                className="transition-colors duration-500"
              />
              
              {/* Lateral Veins */}
              <path d="M32,70 Q45,72 55,75" stroke={day < 7 ? '#166534' : '#78350f'} strokeWidth="1" fill="none" opacity="0.6" className="transition-colors duration-500" />
              <path d="M48,53 Q62,56 72,59" stroke={day < 7 ? '#166534' : '#78350f'} strokeWidth="1" fill="none" opacity="0.6" className="transition-colors duration-500" />
              <path d="M63,35 Q75,38 82,41" stroke={day < 7 ? '#166534' : '#78350f'} strokeWidth="1" fill="none" opacity="0.6" className="transition-colors duration-500" />

              <path d="M32,70 Q22,60 20,48" stroke={day < 7 ? '#166534' : '#78350f'} strokeWidth="1" fill="none" opacity="0.6" className="transition-colors duration-500" />
              <path d="M48,53 Q35,42 30,30" stroke={day < 7 ? '#166534' : '#78350f'} strokeWidth="1" fill="none" opacity="0.6" className="transition-colors duration-500" />
              <path d="M63,35 Q50,24 44,14" stroke={day < 7 ? '#166534' : '#78350f'} strokeWidth="1" fill="none" opacity="0.6" className="transition-colors duration-500" />
              
              {/* Spot Lesions - Number & size scales with day */}
              {/* Spot 1 */}
              {day >= 1 && (
                <g className="transition-all duration-300">
                  <circle cx="45" cy="50" r={Math.min(2 + day * 0.9, 10)} fill="url(#spotGrad)" />
                  <circle cx="45" cy="50" r={Math.min(0.8 + day * 0.4, 4.5)} fill="#271306" opacity="0.85" />
                </g>
              )}
              {/* Spot 2 */}
              {day >= 3 && (
                <g className="transition-all duration-300">
                  <circle cx="60" cy="35" r={Math.min(1.5 + (day - 2) * 0.8, 8)} fill="url(#spotGrad)" />
                  <circle cx="60" cy="35" r={Math.min(0.6 + (day - 2) * 0.35, 3.5)} fill="#271306" opacity="0.8" />
                </g>
              )}
              {/* Spot 3 */}
              {day >= 5 && (
                <g className="transition-all duration-300">
                  <circle cx="35" cy="65" r={Math.min(1.2 + (day - 4) * 0.8, 7)} fill="url(#spotGrad)" />
                  <circle cx="35" cy="65" r={Math.min(0.5 + (day - 4) * 0.35, 3)} fill="#271306" opacity="0.8" />
                </g>
              )}
              {/* Spot 4 */}
              {day >= 7 && (
                <g className="transition-all duration-300">
                  <circle cx="50" cy="65" r={Math.min(1 + (day - 6) * 0.7, 6)} fill="url(#spotGrad)" />
                  <circle cx="50" cy="65" r={Math.min(0.4 + (day - 6) * 0.3, 2.5)} fill="#271306" opacity="0.75" />
                </g>
              )}
              {/* Spot 5 */}
              {day >= 9 && (
                <g className="transition-all duration-300">
                  <circle cx="30" cy="50" r="5" fill="url(#spotGrad)" />
                  <circle cx="30" cy="50" r="2.2" fill="#180a02" opacity="0.9" />
                  <circle cx="55" cy="48" r="4" fill="url(#spotGrad)" />
                  <circle cx="55" cy="48" r="1.8" fill="#180a02" opacity="0.9" />
                </g>
              )}
            </svg>
            <span className="absolute bottom-2 bg-white/80 border border-[#efede6] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm select-none">
              Visual simulation
            </span>
          </div>

          {/* Slider Controls Panel */}
          <div className="flex-1 w-full">
            <h4 className="font-extrabold text-xs text-[#7C8B80] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)] animate-pulse" />
              {t.progressionSlider || 'Disease Development Forecast'}
            </h4>
            
            <div className="flex items-center gap-4 mb-3">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={day} 
                onChange={(e) => setDay(Number(e.target.value))} 
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)] focus:outline-none" 
              />
              <span className="text-sm font-black text-[var(--brand-deep)] px-3 py-1 bg-[var(--brand-light)] border border-[var(--brand-primary)]/10 rounded-xl min-w-[76px] text-center">
                {t.dayLabel || 'Day'} {day}
              </span>
            </div>

            <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed bg-[#FAF9F5] border border-[#efede6] rounded-xl p-3 min-h-[50px]">
              {day < 4 ? PROGRESSION_TEXTS[lang].early : day < 8 ? PROGRESSION_TEXTS[lang].mid : PROGRESSION_TEXTS[lang].late}
            </p>
          </div>
        </motion.div>

        {/* Organic / Chemical Tabs Selection */}
        <motion.div variants={staggerItem} className="w-full flex bg-[var(--surface-soft)] p-1.5 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
          <button
            onClick={() => setActiveTab('organic')}
            className={`flex-1 py-3 text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'organic'
                ? 'bg-white text-[var(--brand-deep)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.organicTab || 'Organic Remedies'} ({organicDoNow.length + organicAvoid.length})
          </button>
          <button
            onClick={() => setActiveTab('chemical')}
            className={`flex-1 py-3 text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'chemical'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.chemicalTab || 'Chemical Controls'} ({chemicalDoNow.length + chemicalAvoid.length})
          </button>
        </motion.div>

        {/* Tabbed Actionable Sections */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          >
            {activeTab === 'organic' ? (
              <>
                <div className="bg-[#FAF9F5] rounded-[var(--radius-lg)] p-5 border border-[#efede6] shadow-sm">
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-1.5 border-b border-[#efede6] pb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    {t.doNow || 'What to do now'}
                  </h3>
                  <ul className="space-y-3.5">
                    {organicDoNow.length > 0 ? (
                      organicDoNow.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[var(--text-primary)] text-sm font-semibold leading-relaxed">
                          <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 border border-emerald-100 shadow-sm">
                            {idx + 1}
                          </div>
                          <span>{step}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-[var(--text-secondary)] italic">
                        {lang === 'kn' ? 'ಯಾವುದೇ ಸಾವಯವ ಕ್ರಮಗಳು ಲಭ್ಯವಿಲ್ಲ.' : lang === 'hi' ? 'कोई जैविक कदम उपलब्ध नहीं हैं।' : 'No organic steps available.'}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="bg-[#FAF9F5] rounded-[var(--radius-lg)] p-5 border border-[#efede6] shadow-sm">
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-1.5 border-b border-[#efede6] pb-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-600" />
                    {t.avoid || 'What to avoid'}
                  </h3>
                  <ul className="space-y-3.5">
                    {organicAvoid.length > 0 ? (
                      organicAvoid.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[var(--text-primary)] text-sm font-semibold leading-relaxed">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                          <span>{step}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-[var(--text-secondary)] italic">
                        {lang === 'kn' ? 'ಯಾವುದೇ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ.' : lang === 'hi' ? 'कोई सावधानी उपलब्ध नहीं है।' : 'No precautions available.'}
                      </li>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="bg-rose-50/20 rounded-[var(--radius-lg)] p-5 border border-rose-100/60 shadow-sm">
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-1.5 border-b border-rose-100 pb-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    {t.chemicalTab || 'Chemical Controls'}
                  </h3>
                  <ul className="space-y-3.5">
                    {chemicalDoNow.length > 0 ? (
                      chemicalDoNow.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[var(--text-primary)] text-sm font-semibold leading-relaxed">
                          <div className="w-5.5 h-5.5 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 border border-rose-100 shadow-sm">
                            {idx + 1}
                          </div>
                          <span>{step}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0 animate-bounce" />
                        <span>
                          {lang === 'kn' 
                            ? 'ಯಾವುದೇ ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿಲ್ಲ. ಸಾವಯವ ಪರಿಹಾರಗಳು ಸಾಕಾಗುತ್ತದೆ.' 
                            : lang === 'hi' 
                              ? 'किसी रासायनिक उपचार की आवश्यकता नहीं है। जैविक उपाय ही पर्याप्त हैं।' 
                              : 'No chemical treatment necessary. Low severity. Organic remedies are sufficient.'}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Safety Warning Card */}
                <div className="bg-amber-50/40 rounded-[var(--radius-lg)] p-5 border border-amber-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs text-amber-800 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                      {t.safetyAlertHeader || 'CHEMICAL SAFETY PRECAUTIONS'}
                    </h3>
                    <p className="text-sm font-semibold text-amber-900 leading-relaxed">
                      {t.safetyAlertDesc || 'Always wear a mask, gloves, and protective eyewear when spraying. Do not spray within 7-14 days of harvest.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Primary Actions */}
        <motion.div variants={staggerItem} className="flex flex-col gap-4 pt-4">
          {/* Audio Speed Controls Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#FAF9F5] border border-[#efede6] rounded-2xl p-4 gap-3 shadow-inner">
            <span className="font-extrabold text-[10px] text-[#7C8B80] uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[var(--brand-primary)]" />
              {lang === 'kn' ? 'ಧ್ವನಿ ಓದುವ ವೇಗ' : lang === 'hi' ? 'आवाज की गति' : 'Voice Playback Speed'}
            </span>
            <div className="flex gap-2">
              {[
                { rate: 0.75, label: lang === 'kn' ? 'ನಿಧಾನ (0.75x)' : lang === 'hi' ? 'धीमा (0.75x)' : 'Slow (0.75x)' },
                { rate: 0.85, label: lang === 'kn' ? 'ಸಾಮಾನ್ಯ (0.85x)' : lang === 'hi' ? 'सामान्य (0.85x)' : 'Clear (0.85x)' },
                { rate: 1.0, label: lang === 'kn' ? 'ವೇಗ (1.0x)' : lang === 'hi' ? 'तेज़ (1.0x)' : 'Fast (1.0x)' }
              ].map((item) => (
                <button
                  key={item.rate}
                  onClick={() => {
                    setSpeechRate(item.rate);
                    if (isPlaying) {
                      startSpeaking(item.rate);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    speechRate === item.rate 
                      ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm' 
                      : 'bg-white text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-soft)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button 
                onClick={togglePlayback}
                className={`flex-1 border text-[var(--text-primary)] px-6 py-4 rounded-[var(--radius-lg)] font-medium text-lg flex justify-center items-center gap-2 transition-colors active:scale-[0.98] shadow-sm cursor-pointer ${isPlaying ? 'bg-[var(--brand-light)] border-[var(--brand-primary)]' : 'bg-white border-[var(--border-subtle)] hover:bg-[var(--surface-soft)]'}`}
              >
                {isPlaying ? <VolumeX className="w-5 h-5 text-[var(--brand-primary)]" /> : <Volume2 className="w-5 h-5" />}
                {isPlaying 
                  ? (lang === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ' : lang === 'hi' ? 'ऑडियो रोकें' : 'Stop Audio')
                  : (lang === 'kn' ? 'ಸಲಹೆ ಆಲಿಸಿ' : lang === 'hi' ? 'सलाह सुनें' : 'Listen to Advice')
                }
              </button>
              
              <button 
                onClick={handleCopy}
                className="flex-1 bg-white border border-[var(--border-subtle)] hover:bg-[var(--surface-soft)] text-[var(--text-primary)] px-6 py-4 rounded-[var(--radius-lg)] font-medium text-lg flex justify-center items-center gap-2 transition-colors active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <Copy className="w-5 h-5 text-[var(--brand-primary)]" />
                {t.copyWhatsApp || 'Copy WhatsApp Message'}
              </button>
            </div>

            <button 
              onClick={handleDownloadCard}
              className="w-full bg-[var(--brand-primary)] hover:bg-[var(--brand-deep)] text-white py-4.5 rounded-[var(--radius-lg)] font-bold text-lg flex justify-center items-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-5 h-5" />
              {t.downloadAdvisoryCard || 'Download WhatsApp Share Card'}
            </button>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={staggerItem} className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed text-center max-w-2xl mx-auto">
            {t.disclaimer || 'This is AI guidance, not a confirmed diagnosis. Please consult an agriculture officer or KVK before chemical treatment.'}
          </p>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}

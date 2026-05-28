import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ArrowRight, Calendar, RefreshCw } from 'lucide-react';
import { UI_STRINGS, Language } from '@/lib/translations';

interface UpdateItem {
  id: number;
  category: 'Seeds' | 'Schemes' | 'News';
  title: string;
  summary: string;
  action: string;
}

const UPDATE_POOL: Record<Language, UpdateItem[]> = {
  en: [
    {
      id: 1,
      category: 'Schemes',
      title: 'PM-Kisan Installment Release',
      summary: 'The Central government is releasing the next PM-Kisan DBT installment. Eligible farmers should complete e-KYC on the PM-Kisan portal to ensure receipt.',
      action: 'Check status on PM-Kisan portal or visit local CSC.'
    },
    {
      id: 2,
      category: 'Seeds',
      title: 'Subsidy on High-Yield Paddy Seeds',
      summary: 'Department of Agriculture is offering a 50% subsidy on certified high-yield paddy seeds (Rani variety) for the upcoming sowing season. Available at local Raitha Kendras.',
      action: 'Visit your local Raitha Samparka Kendra with Land Survey number.'
    },
    {
      id: 3,
      category: 'News',
      title: 'Local Weather and Pest Risk Alert',
      summary: 'With humidity levels crossing 80% due to recent showers, there is an elevated threat of thrips on Chilli crops and early blight on Tomatoes in the district.',
      action: 'Check leaf surfaces and apply organic sprays if pests exceed threshold.'
    },
    {
      id: 4,
      category: 'Schemes',
      title: 'Crop Insurance Sowing Enrollment Open',
      summary: 'Enrollment for PM Fasal Bima Yojana (PMFBY) is now open for the summer crop cycle. Insure your crop against rainfall deficit and natural hazards before the deadline.',
      action: 'Submit land details, bank passbook, and sowing certificate to bank.'
    },
    {
      id: 5,
      category: 'Seeds',
      title: 'Drought-Resistant Ragi Seeds Distribution',
      summary: 'Certified drought-resistant Ragi seeds (GPU-28 variety) are now being distributed at 30% discount. Ideal for regions experiencing delay in rain cycles.',
      action: 'Bring farmer registration card (FRUITS ID) to nearest cooperative bank.'
    },
    {
      id: 6,
      category: 'News',
      title: 'Organic Fertilizer Subsidy Approved',
      summary: 'State Cabinet has approved a new subsidy program to promote compost and vermicompost use. Registered organic farmers will receive cash incentive directly in their bank accounts.',
      action: 'Link organic certification certificate with farmer profile.'
    }
  ],
  kn: [
    {
      id: 1,
      category: 'Schemes',
      title: 'ಪಿಎಂ-ಕಿಸಾನ್ ಕಂತು ಬಿಡುಗಡೆ ಅಪ್ಡೇಟ್',
      summary: 'ಕೇಂದ್ರ ಸರ್ಕಾರವು ಮುಂದಿನ ಪಿಎಂ-ಕಿಸಾನ್ ಡಿಬಿಟಿ ಕಂತನ್ನು ಬಿಡುಗಡೆ ಮಾಡುತ್ತಿದೆ. ರೈತರು ತಮ್ಮ ಜಮಾ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ಪಿಎಂ-ಕಿಸಾನ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಇ-ಕೆವೈಸಿ ಪೂರ್ಣಗೊಳಿಸಬೇಕು.',
      action: 'ಪಿಎಂ-ಕಿಸಾನ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಹತ್ತಿರದ ಸಿಎಸ್‌ಸಿಗೆ ಭೇಟಿ ನೀಡಿ.'
    },
    {
      id: 2,
      category: 'Seeds',
      title: 'ಹೆಚ್ಚು ಇಳುವರಿ ನೀಡುವ ಭತ್ತದ ಬೀಜಗಳಿಗೆ ಸಹಾಯಧನ',
      summary: 'ಮುಂಬರುವ ಬಿತ್ತನೆ ಹಂಗಾಮಿಗಾಗಿ ಕೃಷಿ ಇಲಾಖೆಯು ಪ್ರಮಾಣೀಕೃತ ಭತ್ತದ ಬೀಜಗಳ (ರಾಣಿ ತಳಿ) ಮೇಲೆ 50% ಸಹಾಯಧನ ನೀಡುತ್ತಿದೆ. ಸ್ಥಳೀಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಗಳಲ್ಲಿ ಲಭ್ಯವಿದೆ.',
      action: 'ಭೂಮಿ ಸರ್ವೇ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಸ್ಥಳೀಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.'
    },
    {
      id: 3,
      category: 'News',
      title: 'ಹವಾಮಾನ ಮತ್ತು ಕೀಟ ಬಾಧೆಯ ಎಚ್ಚರಿಕೆ',
      summary: 'ಇತ್ತೀಚಿನ ಮಳೆಯಿಂದಾಗಿ ಆರ್ದ್ರತೆಯ ಮಟ್ಟವು 80% ದಾಟಿದ್ದು, ಜಿಲ್ಲೆಯಲ್ಲಿ ಮೆಣಸಿನಕಾಯಿ ಬೆಳೆಗೆ ನುಸಿ ಮತ್ತು ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಮುಂಜಾನೆ ಎಲೆ ಮಚ್ಚೆ ರೋಗದ ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ.',
      action: 'ಎಲೆಯ ಕೆಳಭಾಗವನ್ನು ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಕೀಟಗಳ ಸಂಖ್ಯೆ ಹೆಚ್ಚಿದ್ದರೆ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.'
    },
    {
      id: 4,
      category: 'Schemes',
      title: 'ಬೆಳೆ ವಿಮೆ ನೋಂದಣಿ ಪ್ರಾರಂಭ',
      summary: 'ಬೇಸಿಗೆ ಬೆಳೆ ಚಕ್ರಕ್ಕೆ ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ (PMFBY) ಅಡಿ ನೋಂದಣಿ ಪ್ರಾರಂಭವಾಗಿದೆ. ಮಳೆ ಕೊರತೆ ಮತ್ತು ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳ ವಿರುದ್ಧ ಕೊನೆಯ ದಿನಾಂಕದೊಳಗೆ ವಿಮೆ ಮಾಡಿ.',
      action: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅಥವಾ ಆನ್‌ಲೈನ್ ಮೂಲಕ ಜಮೀನು ವಿವರಗಳು, ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ ಸಲ್ಲಿಸಿ.'
    },
    {
      id: 5,
      category: 'Seeds',
      title: 'ಬರ-ನಿರೋಧಕ ರಾಗಿ ಬೀಜಗಳ ವಿತರಣೆ',
      summary: 'ಪ್ರಮಾಣೀಕೃತ ಬರ-ನಿರೋಧಕ ರಾಗಿ ಬೀಜಗಳನ್ನು (GPU-28 ತಳಿ) ಈಗ 30% ರಿಯಾಯಿತಿಯಲ್ಲಿ ವಿತರಿಸಲಾಗುತ್ತಿದೆ. ಮಳೆ ವಿಳಂಬವಾಗುತ್ತಿರುವ ಪ್ರದೇಶಗಳಿಗೆ ಇದು ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.',
      action: 'ಹತ್ತಿರದ ಸಹಕಾರಿ ಬ್ಯಾಂಕ್‌ಗೆ ರೈತ ನೋಂದಣಿ ಕಾರ್ಡ್ (FRUITS ID) ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.'
    },
    {
      id: 6,
      category: 'News',
      title: 'ಸಾವಯವ ಗೊಬ್ಬರ ಸಹಾಯಧನಕ್ಕೆ ಅನುಮೋದನೆ',
      summary: 'ಕಾಂಪೋಸ್ಟ್ ಮತ್ತು ವರ್ಮಿಕಾಂಪೋಸ್ಟ್ ಬಳಕೆಯನ್ನು ಉತ್ತೇಜಿಸಲು ರಾಜ್ಯ ಸಚಿವ ಸಂಪುಟ ಹೊಸ ಸಹಾಯಧನ ಯೋಜನೆಗೆ ಅನುಮೋದನೆ ನೀಡಿದೆ. ನೋಂದಾಯಿತ ಸಾವಯವ ರೈತರಿಗೆ ನೇರ ನಗದು ವರ್ಗಾವಣೆಯಾಗಲಿದೆ.',
      action: 'ನಿಮ್ಮ ಸಾವಯವ ಪ್ರಮಾಣಪತ್ರವನ್ನು ರೈತ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಲಿಂಕ್ ಮಾಡಿ.'
    }
  ],
  hi: [
    {
      id: 1,
      category: 'Schemes',
      title: 'पीएम-किसान किस्त जारी होने की सूचना',
      summary: 'केंद्र सरकार द्वारा पीएम-किसान की अगली डीबीटी किस्त जारी की जा रही है। पात्र किसान भुगतान सुनिश्चित करने के लिए पीएम-किसान पोर्टल पर ई-केवाईसी पूरा करें।',
      action: 'पीएम-किसान पोर्टल पर अपनी स्थिति जांचें या नजदीकी सीएससी पर जाएं।'
    },
    {
      id: 2,
      category: 'Seeds',
      title: 'उच्च उपज वाले धान के बीजों पर सब्सिडी',
      summary: 'कृषि विभाग आगामी बुवाई सीजन के लिए प्रमाणित उच्च उपज वाले धान के बीजों (रानी किस्म) पर 50% सब्सिडी प्रदान कर रहा है। स्थानीय रायता केंद्रों पर उपलब्ध।',
      action: 'भूमि सर्वेक्षण संख्या के साथ अपने स्थानीय रायता संपर्क केंद्र पर जाएं।'
    },
    {
      id: 3,
      category: 'News',
      title: 'स्थानीय मौसम और कीट प्रकोप की चेतावनी',
      summary: 'हालिया बारिश के कारण आर्द्रता 80% से अधिक होने से जिले में मिर्च की फसल पर थ्रिप्स और टमाटर पर अगेती अंगमारी का खतरा बढ़ गया है।',
      action: 'पत्तियों के निचले हिस्से की जांच करें और सफेद मक्खी/थ्रिप्स दिखने पर नीम आधारित कीटनाशक का छिड़काव करें।'
    },
    {
      id: 4,
      category: 'Schemes',
      title: 'फसल बीमा पंजीकरण शुरू',
      summary: 'ग्रीष्मकालीन फसल चक्र के लिए प्रधानमंत्री फसल बीमा योजना (PMFBY) के तहत पंजीकरण शुरू हो गया है। समय सीमा से पहले बारिश की कमी और प्राकृतिक आपदाओं के खिलाफ अपनी फसल का बीमा कराएं।',
      action: 'अपने बैंक या ऑनलाइन पोर्टल पर भूमि विवरण, बैंक पासबुक और बुवाई प्रमाण पत्र जमा करें।'
    },
    {
      id: 5,
      category: 'Seeds',
      title: 'सूखा-प्रतिरोधी रागी बीजों का वितरण',
      summary: 'प्रमाणित सूखा-प्रतिरोधी रागी बीजों (GPU-28 किस्म) का वितरण अब 30% छूट पर किया जा रहा है। बारिश में देरी वाले क्षेत्रों के लिए आदर्श।',
      action: 'नजदीकी सहकारी बैंक में किसान पंजीकरण कार्ड (FRUITS ID) लेकर जाएं।'
    },
    {
      id: 6,
      category: 'News',
      title: 'जैविक खाद सब्सिडी को मंजूरी',
      summary: 'राज्य कैबिनेट ने कंपोस्ट और केंचुआ खाद (वर्मीकंपोस्ट) के उपयोग को बढ़ावा देने के लिए नए सब्सिडी कार्यक्रम को मंजूरी दी है। पंजीकृत जैविक किसानों को सीधे नकद लाभ मिलेगा।',
      action: 'जैविक प्रमाणन प्रमाणपत्र को अपने किसान प्रोफाइल से लिंक करें।'
    }
  ]
};

const formatDate = (date: Date, lang: string) => {
  if (lang === 'kn') {
    return date.toLocaleDateString('kn-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } else if (lang === 'hi') {
    return date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getRelativeDayLabel = (offset: number, lang: string) => {
  if (offset === 0) {
    return lang === 'kn' ? 'ಇಂದು' : lang === 'hi' ? 'आज' : 'Today';
  } else if (offset === 1) {
    return lang === 'kn' ? 'ನಿನ್ನೆ' : lang === 'hi' ? 'कल' : 'Yesterday';
  }
  return lang === 'kn' ? `${offset} ದಿನಗಳ ಹಿಂದೆ` : lang === 'hi' ? `${offset} दिन पहले` : `${offset} days ago`;
};

export function FarmerUpdates({ onBack, language = 'en' }: { onBack: () => void; language?: string }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lang = (language as Language) || 'en';
  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  const CATEGORIES = ['All', 'Seeds', 'Schemes', 'News'];
  const CATEGORY_LABELS: Record<string, string> = {
    All: t.all || 'All',
    Seeds: t.seeds || 'Seeds',
    Schemes: t.schemes || 'Schemes',
    News: t.news || 'News'
  };

  // Generate dynamic updates based on today's calendar date so it rotates/updates daily
  const dailyUpdates = useMemo(() => {
    const today = new Date();
    // A deterministic seed based on day, month, and year so it changes every calendar day
    const seed = today.getFullYear() + today.getMonth() * 31 + today.getDate();
    const pool = UPDATE_POOL[lang] || UPDATE_POOL.en;

    // Shuffle pool based on the seed
    const shuffled = [...pool].sort((a, b) => {
      const hashA = (a.id * seed) % pool.length;
      const hashB = (b.id * seed) % pool.length;
      return hashA - hashB;
    });

    // Assign relative days and dates
    return shuffled.map((item, index) => {
      const itemDate = new Date();
      itemDate.setDate(today.getDate() - index);
      return {
        ...item,
        relativeDateLabel: getRelativeDayLabel(index, lang),
        formattedDate: formatDate(itemDate, lang),
        dateObj: itemDate
      };
    });
  }, [lang, isRefreshing]); // refresh will trigger re-shuffling or visual feedback

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const filteredUpdates = activeCategory === 'All' 
    ? dailyUpdates 
    : dailyUpdates.filter(u => u.category === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto flex flex-col pt-4"
    >
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">{t.back || 'Back'}</span>
        </button>

        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-[var(--surface-soft)] rounded-full text-[var(--text-secondary)] transition-colors flex items-center justify-center cursor-pointer"
          title="Refresh updates"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {t.farmerUpdates || 'Farmer Updates'}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm font-medium mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
            {lang === 'kn' ? 'ಮಾದರಿ ಮಾಹಿತಿ ಫೀಡ್' : lang === 'hi' ? 'नमूना सूचना फीड' : 'Sample information feed'}
          </p>
        </div>
      </div>
      
      {/* Segmented Filter */}
      <div className="flex overflow-x-auto pb-4 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        <div className="flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-extrabold text-sm whitespace-nowrap transition-colors cursor-pointer border ${
                activeCategory === cat 
                  ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)] shadow-sm' 
                  : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredUpdates.map(update => (
            <motion.div
              key={update.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[var(--radius-lg)] p-5.5 sm:p-6 border border-[#efebe0] shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)] relative overflow-hidden"
            >
              {/* Dynamic Left accent bar based on category */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                update.category === 'Seeds' 
                  ? 'bg-emerald-500' 
                  : update.category === 'Schemes' 
                    ? 'bg-blue-500' 
                    : 'bg-amber-500'
              }`}></div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                  update.category === 'Seeds' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : update.category === 'Schemes' 
                      ? 'bg-blue-50 text-blue-700 border-blue-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {CATEGORY_LABELS[update.category]}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-100">
                  Sample
                </span>
                
                {/* Dynamic dates relative to today */}
                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#7C8B80] uppercase tracking-wide">
                  <span>{update.relativeDateLabel}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{update.formattedDate}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-black text-[var(--text-primary)] mb-2 leading-snug">{update.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed font-medium">{update.summary}</p>
              
              <div className="flex items-center justify-between pt-3.5 border-t border-[#efede6] mt-4">
                <p className="text-xs font-extrabold text-[var(--brand-deep)] flex-1 pr-4">{update.action}</p>
                <div className="w-8 h-8 rounded-full bg-[var(--surface-soft)] flex items-center justify-center flex-shrink-0 text-[var(--text-secondary)] border border-[#efede6]">
                  <ArrowRight className="w-4 h-4 text-[var(--brand-primary)]" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredUpdates.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)] bg-white rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-inner font-medium">
            {lang === 'kn' ? 'ಈ ವರ್ಗಕ್ಕೆ ಯಾವುದೇ ಅಪ್ಡೇಟ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' : lang === 'hi' ? 'इस श्रेणी के लिए कोई अपडेट नहीं मिला।' : 'No updates found for this category.'}
          </div>
        )}
      </div>
    </motion.div>
  );
}

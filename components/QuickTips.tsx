import { Info } from 'lucide-react';
import { motion } from 'motion/react';
import { CROP_TRANSLATIONS, Language, getLocalizedCropName } from '@/lib/translations';

const CROP_TIPS: Record<string, Record<string, string[]>> = {
  'Tomato': {
    en: [
      'Ensure proper staking and pruning to improve air circulation.',
      'Water consistently at the base to prevent blossom end rot.',
      'Rotate crops yearly to avoid soil-borne diseases.'
    ],
    kn: [
      'ಗಾಳಿ ಸಂಚಾರವನ್ನು ಸುಧಾರಿಸಲು ಸರಿಯಾದ ಆಧಾರ (staking) ಮತ್ತು ಕತ್ತರಿ ಕೆಲಸವನ್ನು (pruning) ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
      'ಹೂವಿನ ಕೊಳೆತ ರೋಗವನ್ನು ತಡೆಗಟ್ಟಲು ಬುಡದಲ್ಲಿ ನಿಯಮಿತವಾಗಿ ನೀರುಣಿಸಿ.',
      'ಮಣ್ಣಿನ ಮೂಲಕ ಹರಡುವ ರೋಗಗಳನ್ನು ತಪ್ಪಿಸಲು ವರ್ಷಕ್ಕೊಮ್ಮೆ ಬೆಳೆ ಸರದಿಯನ್ನು ಅನುಸರಿಸಿ.'
    ],
    hi: [
      'हवा के संचलन को बेहतर बनाने के लिए पौधों को सहारा दें और छंटाई करें।',
      'ब्लॉसम एंड रोट (फूलों का सड़ना) से बचने के लिए पौधों के आधार पर नियमित रूप से पानी दें।',
      'मिट्टी से होने वाली बीमारियों से बचने के लिए हर साल फसल चक्र अपनाएं।'
    ]
  },
  'Paddy': {
    en: [
      'Maintain optimal water levels during different growth stages.',
      'Apply fertilizers in split doses for better absorption.',
      'Keep fields weed-free during the first 30-45 days.'
    ],
    kn: [
      'ಬೆಳವಣಿಗೆಯ ವಿವಿಧ ಹಂತಗಳಲ್ಲಿ ಸೂಕ್ತವಾದ ನೀರಿನ ಮಟ್ಟವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.',
      'ಉತ್ತಮ ಹೀರಿಕೊಳ್ಳುವಿಕೆಗಾಗಿ ರಸಗೊಬ್ಬರಗಳನ್ನು ವಿಭಜಿತ ಕಂತುಗಳಲ್ಲಿ ಅನ್ವಯಿಸಿ.',
      'ಮೊದಲ 30-45 ದಿನಗಳಲ್ಲಿ ಗದ್ದೆಯನ್ನು ಕಳೆ ರಹಿತವಾಗಿಡಿ.'
    ],
    hi: [
      'विकास के विभिन्न चरणों के दौरान पानी का अनुकूल स्तर बनाए रखें।',
      'बेहतर अवशोषण के लिए उर्वरकों का उपयोग टुकड़ों में करें।',
      'पहले 30-45 दिनों के दौरान खेतों को खरपतवार मुक्त रखें।'
    ]
  },
  'Ragi': {
    en: [
      'Ensure well-drained soil as ragi is sensitive to waterlogging.',
      'Thin out plants after 15 days to maintain proper spacing.',
      'Apply organic manure during land preparation.'
    ],
    kn: [
      'ರಾಗಿ ನಿಂತ ನೀರಿಗೆ ಸೂಕ್ಷ್ಮವಾಗಿರುವುದರಿಂದ ಉತ್ತಮ ನೀರು ಬಸಿಯುವ ಮಣ್ಣನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
      'ಸರಿಯಾದ ಅಂತರವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು 15 ದಿನಗಳ ನಂತರ ಸಸಿಗಳನ್ನು ತೆಳುಗೊಳಿಸಿ.',
      'ಭೂಮಿ ತಯಾರಿಕೆಯ ಸಮಯದಲ್ಲಿ ಸಾವಯವ ಗೊಬ್ಬರವನ್ನು ಅನ್ವಯಿಸಿ.'
    ],
    hi: [
      'अच्छी जल निकासी वाली मिट्टी सुनिश्चित करें क्योंकि रागी जलभराव के प्रति संवेदनशील है।',
      'सही दूरी बनाए रखने के लिए 15 दिनों के बाद पौधों को पतला (विरल) करें।',
      'खेत की तैयारी के दौरान जैविक खाद डालें।'
    ]
  },
  'Chilli': {
    en: [
      'Avoid overwatering to prevent root rot and wilting.',
      'Monitor closely for thrips and aphids on new leaves.',
      'Apply timely top dressing of nitrogen.'
    ],
    kn: [
      'ಬೇರು ಕೊಳೆತ ಮತ್ತು ಬಾಡುವಿಕೆಯನ್ನು ತಡೆಯಲು ಅತಿಯಾದ ನೀರುಣಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ.',
      'ಹೊಸ ಎಲೆಗಳ ಮೇಲೆ ನುಸಿಗಳು (thrips) ಮತ್ತು ಜೇನು ಹುಳುಗಳನ್ನು (aphids) ಹತ್ತಿರದಿಂದ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.',
      'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಸಾರಜನಕದ ಮೇಲುಗೊಬ್ಬರವನ್ನು ಅನ್ವಯಿಸಿ.'
    ],
    hi: [
      'जड़ सड़न और मुरझाने से बचने के लिए अत्यधिक सिंचाई से बचें।',
      'नई पत्तियों पर थ्रिप्स और एफिड्स (कीड़ों) की बारीकी से निगरानी करें।',
      'समय पर नाइट्रोजन का छिड़काव या खाद डालें।'
    ]
  },
  'Maize': {
    en: [
      'Ensure adequate soil moisture during the tasseling and silking stages.',
      'Manage fall armyworm proactively using recommended traps or sprays.',
      'Maintain proper plant population for maximum yield.'
    ],
    kn: [
      'ತೆನೆ ಮೂಡುವ ಮತ್ತು ರೇಷ್ಮೆ ಬರುವ ಹಂತಗಳಲ್ಲಿ ಮಣ್ಣಿನಲ್ಲಿ ಸಾಕಷ್ಟು ತೇವಾಂಶವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
      'ಶಿಫಾರಸು ಮಾಡಿದ ಬಲೆಗಳು ಅಥವಾ ಸಿಂಪಡಣೆಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಕತ್ತರಿ ಹುಳುಗಳನ್ನು (fall armyworm) ಪೂರ್ವಭಾವಿಯಾಗಿ ನಿರ್ವಹಿಸಿ.',
      'ಗರಿಷ್ಠ ಇಳುವರಿಗಾಗಿ ಸರಿಯಾದ ಸಸ್ಯ ಸಂಖ್ಯೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.'
    ],
    hi: [
      'भुट्टा बनने और दाने भरने की अवस्था में मिट्टी में पर्याप्त नमी सुनिश्चित करें।',
      'अनुशंसित जाल या कीटनाशकों का उपयोग करके फॉल आर्मीवर्म का पहले से प्रबंधन करें।',
      'अधिकतम उपज के लिए पौधों की सही संख्या बनाए रखें।'
    ]
  }
};

const DEFAULT_TIPS: Record<string, string[]> = {
  en: [
    'Regularly monitor your fields for early signs of pests or diseases.',
    'Maintain good soil health by adding organic matter.',
    'Use clean and certified seeds for better germination and yield.'
  ],
  kn: [
    'ಕೀಟಗಳು ಅಥವಾ ರೋಗಗಳ ಆರಂಭಿಕ ಚಿಹ್ನೆಗಳಿಗಾಗಿ ನಿಮ್ಮ ಹೊಲಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.',
    'ಸಾವಯವ ಪದಾರ್ಥಗಳನ್ನು ಸೇರಿಸುವ ಮೂಲಕ ಉತ್ತಮ ಮಣ್ಣಿನ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.',
    'ಉತ್ತಮ ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ ಮತ್ತು ಇಳುವರಿಗಾಗಿ ಸ್ವಚ್ಛ ಮತ್ತು ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಬಳಸಿ.'
  ],
  hi: [
    'कीटों या बीमारियों के शुरुआती लक्षणों के लिए नियमित रूप से अपने खेतों की निगरानी करें।',
    'जैविक पदार्थ मिलाकर मिट्टी का स्वास्थ्य अच्छा बनाए रखें।',
    'बेहतर अंकुरण और उपज के लिए साफ और प्रमाणित बीजों का उपयोग करें।'
  ]
};

export function QuickTips({ crop, language }: { crop: string; language: string }) {
  const lang = (language as Language) || 'en';
  const cropTips = CROP_TIPS[crop]?.[lang] || DEFAULT_TIPS[lang] || DEFAULT_TIPS.en;
  
  const cropNameTrans = getLocalizedCropName(crop, lang);

  const headingText = lang === 'kn' 
    ? `${cropNameTrans ? `${cropNameTrans} ಗಾಗಿ` : 'ನಿಮ್ಮ ಬೆಳೆಗಾಗಿ'} ತ್ವರಿತ ಸಲಹೆಗಳು`
    : lang === 'hi'
      ? `${cropNameTrans ? `${cropNameTrans} के लिए` : 'आपकी फसल के लिए'} त्वरित सुझाव`
      : `Quick Tips for ${cropNameTrans || 'your crop'}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-xl mx-auto mt-8 bg-[var(--surface-soft)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-subtle)]"
    >
      <div className="flex items-center gap-2 mb-3 text-[var(--brand-deep)]">
        <Info className="w-5 h-5 text-[var(--brand-primary)]" />
        <h3 className="font-semibold text-lg">{headingText}</h3>
      </div>
      <ul className="space-y-3">
        {cropTips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-[var(--text-secondary)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-2 flex-shrink-0"></div>
            <span className="leading-relaxed">{tip}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

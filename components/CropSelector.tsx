import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, Sprout, ShieldAlert, Sparkles, X, Mic, Info, Camera, ImageIcon, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { UI_STRINGS, CROP_TRANSLATIONS, Language, getLocalizedCropName } from '@/lib/translations';

const COMMON_CROPS = ['Tomato', 'Paddy', 'Ragi', 'Chilli', 'Maize'];

const CROP_EMOJIS: Record<string, string> = {
  Tomato: '🍅',
  Paddy: '🌾',
  Ragi: '🌿',
  Chilli: '🌶',
  Maize: '🌽'
};

const CROP_TIPS: Record<string, Record<Language, string[]>> = {
  Tomato: {
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
  Paddy: {
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
  Ragi: {
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
  Chilli: {
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
  Maize: {
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

const MANAGER_STRINGS: Record<Language, Record<string, string>> = {
  en: {
    managerTitle: 'Crop Manager',
    careTips: 'Care Tips',
    weatherRisk: 'Weather Blight Risk',
    startDiagnosis: 'Diagnose Crop Problem',
    close: 'Close',
    lowRisk: 'Low Risk',
    modRisk: 'Moderate Risk',
    riskTomato: 'Early Blight Risk: Moderate due to warm humidity. Avoid overhead watering.',
    riskPaddy: 'Root Rot Risk: Low. Keep water level consistent at 2-3 inches.',
    riskRagi: 'Fungal Risk: Low. Soil moisture is optimal for transplanting.',
    riskChilli: 'Leaf Curl Risk: Moderate. Watch for thrips and avoid logging water.',
    riskMaize: 'Armyworm Risk: Low. Monitor leaf whorls regularly for early signs.',
    defaultRisk: 'Weather is favorable. Regularly monitor leaf health.'
  },
  kn: {
    managerTitle: 'ಬೆಳೆ ವ್ಯವಸ್ಥಾಪಕ',
    careTips: 'ಆರೈಕೆ ಸಲಹೆಗಳು',
    weatherRisk: 'ಹವಾಮಾನದ ರೋಗದ ಅಪಾಯ',
    startDiagnosis: 'ರೋಗನಿರ್ಣಯವನ್ನು ಪ್ರಾರಂಭಿಸಿ',
    close: 'ಮುಚ್ಚಿ',
    lowRisk: 'ಕಡಿಮೆ ಅಪಾಯ',
    modRisk: 'ಮಧ್ಯಮ ಅಪಾಯ',
    riskTomato: 'ಎಲೆ ಚುಕ್ಕೆ ರೋಗದ ಅಪಾಯ: ಬೆಚ್ಚಗಿನ ಆರ್ದ್ರತೆಯಿಂದಾಗಿ ಮಧ್ಯಮ. ಮೇಲಿನಿಂದ ನೀರುಣಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ.',
    riskPaddy: 'ಬೇರು ಕೊಳೆತ ರೋಗದ ಅಪಾಯ: ಕಡಿಮೆ. ನೀರಿನ ಮಟ್ಟವನ್ನು 2-3 ಇಂಚುಗಳಲ್ಲಿ ಸ್ಥಿರವಾಗಿಡಿ.',
    riskRagi: 'ಶಿಲೀಂಧ್ರ ಅಪಾಯ: ಕಡಿಮೆ. ನಾಟಿ ಮಾಡಲು ಮಣ್ಣಿನ ತೇವಾಂಶವು ಸೂಕ್ತವಾಗಿದೆ.',
    riskChilli: 'ಎಲೆ ಮುರುಟು ರೋಗದ ಅಪಾಯ: ಮಧ್ಯಮ. ನುಸಿಗಳನ್ನು ಗಮನಿಸಿ ಮತ್ತು ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
    riskMaize: 'ಕತ್ತರಿ ಹುಳು ಅಪಾಯ: ಕಡಿಮೆ. ಆರಂಭಿಕ ಚಿಹ್ನೆಗಳಿಗಾಗಿ ಸುಳಿ ಎಲೆಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಗಮನಿಸಿ.',
    defaultRisk: 'ಹವಾಮಾನವು ಅನುಕೂಲಕರವಾಗಿದೆ. ಎಲೆಗಳ ಆರೋಗ್ಯವನ್ನು ನಿಯಮಿತವಾಗಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.'
  },
  hi: {
    managerTitle: 'फसल प्रबंधक',
    careTips: 'देखभाल के सुझाव',
    weatherRisk: 'मौसम जनित रोग का जोखिम',
    startDiagnosis: 'रोग निदान शुरू करें',
    close: 'बंद करें',
    lowRisk: 'कम जोखिम',
    modRisk: 'मध्यम जोखिम',
    riskTomato: 'अंगमारी रोग का जोखिम: गर्म आर्द्रता के कारण मध्यम। ऊपर से पानी देने से बचें।',
    riskPaddy: 'जड़ सड़न का जोखिम: कम। पानी का स्तर 2-3 इंच पर बनाए रखें।',
    riskRagi: 'कवक का जोखिम: कम। रोपाई के लिए मिट्टी की नमी सर्वोत्तम है।',
    riskChilli: 'पर्ण कुंचन (लीफ कर्ल) का जोखिम: मध्यम। थ्रिप्स पर नज़र रखें और जलभराव से बचें।',
    riskMaize: 'फॉल्स आर्मीवर्म का जोखिम: कम। शुरुआती लक्षणों के लिए पत्तियों की नियमित निगरानी करें।',
    defaultRisk: 'मौसम अनुकूल है। नियमित रूप से पत्तियों के स्वास्थ्य की निगरानी करें।'
  }
};

const WEATHER_RISK_STRINGS: Record<Language, Record<string, { highRainText: string; hotDryText: string }>> = {
  en: {
    Tomato: {
      highRainText: 'Early Blight Risk: HIGH. Rain expected in 24h. Apply preventative organic fungicide (neem-based) and avoid pruning in wet conditions.',
      hotDryText: 'Red Mites Risk: MODERATE. High heat increases pest cycles. Spray water mist at base of crop to keep leaves humid.'
    },
    Paddy: {
      highRainText: 'Paddy Blast Risk: HIGH. Expected rain increases spore spread. Keep water levels regulated and check for eye-shaped leaf lesions.',
      hotDryText: 'Stem Borer Risk: MODERATE. Warm sunny conditions are active for moths. Install pheromone traps.'
    },
    Chilli: {
      highRainText: 'Fruit Rot / Damping Off Risk: HIGH. High rain probability. Ensure efficient drainage channels to prevent root waterlogging.',
      hotDryText: 'Leaf Curl / Thrips Risk: HIGH. High heat (>30°C) is ideal for thrips multiplier. Inspect undersides of leaves.'
    },
    Ragi: {
      highRainText: 'Blast Disease Risk: MODERATE. Damp weather increases fungal load. Keep plant density spaced out.',
      hotDryText: 'Optimal Conditions: Ragi is heat-tolerant. Weather is favorable for healthy grain growth.'
    },
    Maize: {
      highRainText: 'Turcicum Leaf Blight Risk: MODERATE. Humid weather warning. Monitor lower leaves for long elliptical spots.',
      hotDryText: 'Fall Armyworm Risk: HIGH. High heat accelerates larval development. Check crop whorls.'
    }
  },
  kn: {
    Tomato: {
      highRainText: 'ಎಲೆ ಚುಕ್ಕೆ ರೋಗದ ಅಪಾಯ: ಹೆಚ್ಚು. 24 ಗಂಟೆಗಳಲ್ಲಿ ಮಳೆ ನಿರೀಕ್ಷೆಯಿದೆ. ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.',
      hotDryText: 'ಕೆಂಪು ನುಸಿ ಹುಳು ಅಪಾಯ: ಮಧ್ಯಮ. ತಾಪಮಾನ ಹೆಚ್ಚಿರುವುದರಿಂದ ಬೆಳೆಯ ಬುಡದಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿಕೊಳ್ಳಿ.'
    },
    Paddy: {
      highRainText: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗದ ಅಪಾಯ: ಹೆಚ್ಚು. ಮುಂಬರುವ ಮಳೆಯು ರೋಗ ಹರಡುವಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. ನೀರು ಸರಾಗವಾಗಿ ಹರಿಯುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
      hotDryText: 'ಕಾಂಡ ಕೊರಕದ ಅಪಾಯ: ಮಧ್ಯಮ. ಬೆಚ್ಚಗಿನ ಬಿಸಿಲು ಚಿಟ್ಟೆಗಳ ಹಾವಳಿಗೆ ಕಾರಣವಾಗಬಹುದು.'
    },
    Chilli: {
      highRainText: 'ಹಣ್ಣು ಕೊಳೆತ ರೋಗದ ಅಪಾಯ: ಹೆಚ್ಚು. ಕೃಷಿ ಗದ್ದೆಗಳಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.',
      hotDryText: 'ಎಲೆ ಮುರುಟು ರೋಗದ ಅಪಾಯ: ಹೆಚ್ಚು. 30°C ಗಿಂತ ಹೆಚ್ಚಿನ ತಾಪಮಾನವು ನುಸಿಗಳ ಸಂಖ್ಯೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.'
    },
    Ragi: {
      highRainText: 'ರೋಗದ ಅಪಾಯ: ಮಧ್ಯಮ. ಒದ್ದೆಯಾದ ಹವಾಮಾನವು ಶಿಲೀಂಧ್ರವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.',
      hotDryText: 'ಅನುಕೂಲಕರ ಹವಾಮಾನ: ರಾಗಿ ಉಷ್ಣತೆಯನ್ನು ತಡೆದುಕೊಳ್ಳಬಲ್ಲದು. ಹವಾಮಾನ ಸೂಕ್ತವಾಗಿದೆ.'
    },
    Maize: {
      highRainText: 'ಎಲೆ ಮಚ್ಚೆ ರೋಗದ ಅಪಾಯ: ಮಧ್ಯಮ. ಕೆಳಗಿನ ಎಲೆಗಳಲ್ಲಿ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      hotDryText: 'ಕತ್ತರಿ ಹುಳು ಅಪಾಯ: ಹೆಚ್ಚು. ಅಧಿಕ ಶಾಖದಿಂದಾಗಿ ಹುಳುಗಳ ಹಾವಳಿ ಹೆಚ್ಚಬಹುದು.'
    }
  },
  hi: {
    Tomato: {
      highRainText: 'अंगमारी रोग का जोखिम: उच्च। 24 घंटे में बारिश की संभावना। निवारक कवकनाशी का छिड़काव करें।',
      hotDryText: 'लाल मकड़ी का जोखिम: मध्यम। तापमान अधिक होने से कीटों का प्रकोप बढ़ सकता है।'
    },
    Paddy: {
      highRainText: 'झोंका (ब्लास्ट) रोग का जोखिम: उच्च। आने वाली बारिश संक्रमण फैला सकती है। जल निकासी की व्यवस्था करें।',
      hotDryText: 'तना छेदक का जोखिम: मध्यम। गर्म खिली धूप कीटों के अनुकूल है।'
    },
    Chilli: {
      highRainText: 'फल सड़न का जोखिम: उच्च। अधिक बारिश से जड़ गलन संभव। पानी निकासी सुधारे।',
      hotDryText: 'पर्ण कुंचन (लीफ कर्ल) जोखिम: उच्च। 30°C से अधिक तापमान थ्रिप्स कीटों के लिए अनुकूल है।'
    },
    Ragi: {
      highRainText: 'ब्लास्ट रोग का जोखिम: मध्यम। नम वातावरण में फंगल संक्रमण बढ़ सकता है।',
      hotDryText: 'अनुकूल स्थिति: रागी गर्मी सहन कर सकती है। मौसम वृद्धि के लिए अनुकूल है।'
    },
    Maize: {
      highRainText: 'पत्ती झुलसा रोग का जोखिम: मध्यम। पत्ती के निचले हिस्से की जांच करें।',
      hotDryText: 'फॉल्स आर्मीवर्म का जोखिम: उच्च। गर्मी बढ़ने से सूंडियों का प्रकोप बढ़ सकता है।'
    }
  }
};

const CROP_CALENDARS: Record<string, Record<Language, { week: string; task: string; status: 'completed' | 'current' | 'future' }[]>> = {
  Tomato: {
    en: [
      { week: 'Week 1-2', task: 'Nursery preparation, sowing seeds, and setting up shade net.', status: 'completed' },
      { week: 'Week 3-4', task: 'Transplanting seedlings to main field and installing stakes.', status: 'current' },
      { week: 'Week 5-6', task: 'Pruning lower leaves, weeding, and applying first dose of NPK.', status: 'future' },
      { week: 'Week 7-8', task: 'Flowering stage care: spray neem oil, maintain soil moisture.', status: 'future' },
      { week: 'Week 9-10', task: 'Harvesting firm, red ripe tomatoes and grading them.', status: 'future' }
    ],
    kn: [
      { week: 'ವಾರ 1-2', task: 'ನರ್ಸರಿ ತಯಾರಿ, ಬೀಜ ಬಿತ್ತನೆ ಮತ್ತು ನೆರಳು ಪರದೆ ಅಳವಡಿಕೆ.', status: 'completed' },
      { week: 'ವಾರ 3-4', task: 'ಸಸಿಗಳನ್ನು ಪ್ರಮುಖ ಗದ್ದೆಗೆ ನಾಟಿ ಮಾಡುವುದು ಮತ್ತು ಆಧಾರ ಕಂಬ ನೆಡುವುದು.', status: 'current' },
      { week: 'ವಾರ 5-6', task: 'ಕೆಳಗಿನ ಎಲೆಗಳ ಕತ್ತರಿ, ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಎನ್‌ಪಿಕೆ ಮೊದಲ ಕಂತು ಗೊಬ್ಬರ ಹಾಕುವುದು.', status: 'future' },
      { week: 'ವಾರ 7-8', task: 'ಹೂ ಬಿಡುವ ಹಂತದ ಆರೈಕೆ: ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ, ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿ.', status: 'future' },
      { week: 'ವಾರ 9-10', task: 'ಗಟ್ಟಿಯಾದ, ಕೆಂಪು ಬಣ್ಣದ ಟೊಮೆಟೊಗಳ ಕೊಯ್ಲು ಮತ್ತು ವರ್ಗೀಕರಣ.', status: 'future' }
    ],
    hi: [
      { week: 'सप्ताह 1-2', task: 'नर्सरी तैयार करना, बीज बोना और शेड नेट लगाना।', status: 'completed' },
      { week: 'सप्ताह 3-4', task: 'मुख्य खेत में पौधों की रोपाई और सहारा (स्टेकिंग) देना।', status: 'current' },
      { week: 'सप्ताह 5-6', task: 'निचली पत्तियों की छंटाई, निराई और NPK की पहली खुराक देना।', status: 'future' },
      { week: 'सप्ताह 7-8', task: 'फूल आने की अवस्था में देखभाल: नीम तेल का छिड़काव करें, नमी बनाए रखें।', status: 'future' },
      { week: 'सप्ताह 9-10', task: 'लाल और पके टमाटरों की तुड़ाई (कटाई) और ग्रेडिंग करना।', status: 'future' }
    ]
  },
  Paddy: {
    en: [
      { week: 'Week 1-2', task: 'Land leveling, seedling nursery bed preparation and sowing.', status: 'completed' },
      { week: 'Week 3-4', task: 'Transplanting seedlings and flooding fields to 2-3 cm.', status: 'current' },
      { week: 'Week 5-6', task: 'Tillering stage: apply nitrogen top dressing, manage weeds.', status: 'future' },
      { week: 'Week 7-8', task: 'Panicle initiation stage: maintain shallow water depth.', status: 'future' },
      { week: 'Week 9-10', task: 'Drain fields 10 days before harvesting when grains turn golden.', status: 'future' }
    ],
    kn: [
      { week: 'ವಾರ 1-2', task: 'ಭೂಮಿ ಮಟ್ಟ ಮಾಡುವುದು, ಸಸಿಗಳ ಮಡಿ ತಯಾರಿಸುವುದು ಮತ್ತು ಬಿತ್ತನೆ.', status: 'completed' },
      { week: 'ವಾರ 3-4', task: 'ಸಸಿಗಳನ್ನು ನಾಟಿ ಮಾಡುವುದು ಮತ್ತು ಗದ್ದೆಯಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸುವುದು.', status: 'current' },
      { week: 'ವಾರ 5-6', task: 'ತೆನೆ ಒಡೆಯುವ ಹಂತ: ಸಾರಜನಕ ಗೊಬ್ಬರ ಅನ್ವಯಿಸುವುದು, ಕಳೆ ಕೀಳುವುದು.', status: 'future' },
      { week: 'ವಾರ 7-8', task: 'ತೆನೆ ಮೂಡುವ ಹಂತ: ಕಡಿಮೆ ಪ್ರಮಾಣದ ನೀರಿನ ಮಟ್ಟ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು.', status: 'future' },
      { week: 'ವಾರ 9-10', task: 'ಕಾಳುಗಳು ಚಿನ್ನದ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮುಂಚಿತವಾಗಿ ನೀರು ಬಸಿಯುವುದು.', status: 'future' }
    ],
    hi: [
      { week: 'सप्ताह 1-2', task: 'खेत समतलीकरण, पौध नर्सरी बेड तैयार करना और बुवाई।', status: 'completed' },
      { week: 'सप्ताह 3-4', task: 'पौधों की रोपाई और खेतों में 2-3 सेमी तक पानी भरना।', status: 'current' },
      { week: 'सप्ताह 5-6', task: 'कल्ले फूटने की अवस्था: नाइट्रोजन की खाद डालना, खरपतवार नियंत्रण।', status: 'future' },
      { week: 'सप्ताह 7-8', task: 'बालियां निकलने की अवस्था: खेत में हल्का पानी बनाए रखें।', status: 'future' },
      { week: 'सप्ताह 9-10', task: 'दाने सुनहरे होने पर कटाई से 10 दिन पहले पानी निकाल दें।', status: 'future' }
    ]
  },
  Ragi: {
    en: [
      { week: 'Week 1-2', task: 'Dry tillage, mixing organic manure, and sowing seeds directly.', status: 'completed' },
      { week: 'Week 3-4', task: 'Weeding, thinning plants to maintain spacing of 10cm.', status: 'current' },
      { week: 'Week 5-6', task: 'Vegetative growth: apply secondary weeding and bio-fertilizer.', status: 'future' },
      { week: 'Week 7-8', task: 'Earhead emergence stage: protect crop from grazing and birds.', status: 'future' },
      { week: 'Week 9-10', task: 'Harvesting earheads when brown, threshing and sun drying grains.', status: 'future' }
    ],
    kn: [
      { week: 'ವಾರ 1-2', task: 'ಒಣ ಉಳುಮೆ, ಸಾವಯವ ಗೊಬ್ಬರ ಮಿಶ್ರಣ ಮತ್ತು ನೇರ ಬೀಜ ಬಿತ್ತನೆ.', status: 'completed' },
      { week: 'ವಾರ 3-4', task: 'ಕಳೆ ಕೀಳುವುದು, 10 ಸೆಂ.ಮೀ ಅಂತರ ಕಾಪಾಡಲು ಸಸಿಗಳನ್ನು ತೆಳುಗೊಳಿಸುವುದು.', status: 'current' },
      { week: 'ವಾರ 5-6', task: 'ಅಂಗಾಂಗ ಬೆಳವಣಿಗೆ: ಎರಡನೇ ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಜೈವಿಕ ಗೊಬ್ಬರ ಅನ್ವಯಿಸುವುದು.', status: 'future' },
      { week: 'ವಾರ 7-8', task: 'ತೆನೆ ಬರುವ ಹಂತ: ಮೇಯುವ ಪ್ರಾಣಿಗಳು ಮತ್ತು ಪಕ್ಷಿಗಳಿಂದ ಬೆಳೆಯನ್ನು ರಕ್ಷಿಸುವುದು.', status: 'future' },
      { week: 'ವಾರ 9-10', task: 'ತೆನೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕೊಯ್ಲು ಮಾಡುವುದು, ಒಕ್ಕಣೆ ಮಾಡುವುದು ಮತ್ತು ಧಾನ್ಯಗಳನ್ನು ಒಣಗಿಸುವುದು.', status: 'future' }
    ],
    hi: [
      { week: 'सप्ताह 1-2', task: 'सूखी जुताई, जैविक खाद मिलाना और सीधे बीज बोना।', status: 'completed' },
      { week: 'सप्ताह 3-4', task: 'निराई, 10 सेमी की दूरी बनाए रखने के लिए पौधों को विरल करना।', status: 'current' },
      { week: 'सप्ताह 5-6', task: 'वानस्पतिक विकास: दूसरी निराई और जैव-उर्वरक का उपयोग।', status: 'future' },
      { week: 'सप्ताह 7-8', task: 'बालियां निकलने का चरण: फसल को पशुओं और पक्षियों से बचाएं।', status: 'future' },
      { week: 'सप्ताह 9-10', task: 'बालियां भूरी होने पर कटाई, मड़ाई और दानों को धूप में सुखाना।', status: 'future' }
    ]
  },
  Chilli: {
    en: [
      { week: 'Week 1-2', task: 'Seed treatment with Trichoderma, seedbed sowing.', status: 'completed' },
      { week: 'Week 3-4', task: 'Transplanting with 45cm spacing, light irrigation.', status: 'current' },
      { week: 'Week 5-6', task: 'Earthing up, apply NPK fertilizer top dressing.', status: 'future' },
      { week: 'Week 7-8', task: 'Flowering & fruiting: spray neem oil, prevent leaf curls.', status: 'future' },
      { week: 'Week 9-10', task: 'First picking of green chillies, continue irrigation cycles.', status: 'future' }
    ],
    kn: [
      { week: 'ವಾರ 1-2', task: 'ವಿಷಬೀಜೋಪಚಾರ (ಟ್ರೈಕೋಡರ್ಮಾ), ಸಸಿಮಡಿ ಬಿತ್ತನೆ.', status: 'completed' },
      { week: 'ವಾರ 3-4', task: '45 ಸೆಂ.ಮೀ ಅಂತರದೊಂದಿಗೆ ನಾಟಿ ಮಾಡುವುದು, ಲಘು ನೀರಾವರಿ.', status: 'current' },
      { week: 'ವಾರ 5-6', task: 'ಮಣ್ಣು ಏರಿಸುವುದು, ಎನ್‌ಪಿಕೆ ಗೊಬ್ಬರ ಅನ್ವಯಿಸುವುದು.', status: 'future' },
      { week: 'ವಾರ 7-8', task: 'ಹೂ ಬಿಡುವುದು ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವುದು: ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ, ಎಲೆ ಮುರುಟು ತಡೆಯಿರಿ.', status: 'future' },
      { week: 'ವಾರ 9-10', task: 'ಹಸಿರು ಮೆಣಸಿನಕಾಯಿಯ ಮೊದಲ ಕೊಯ್ಲು, ನೀರಾವರಿ ಮುಂದುವರಿಸಿ.', status: 'future' }
    ],
    hi: [
      { week: 'सप्ताह 1-2', task: 'ट्राइकोडेर्मा से बीजोपचार, क्यारी में बुवाई।', status: 'completed' },
      { week: 'सप्ताह 3-4', task: '45 सेमी की दूरी पर रोपाई और हल्की सिंचाई।', status: 'current' },
      { week: 'सप्ताह 5-6', task: 'मिट्टी चढ़ाना, NPK उर्वरक की खाद डालना।', status: 'future' },
      { week: 'सप्ताह 7-8', task: 'फूल और फल आना: नीम तेल छिड़कें, पर्ण कुंचन से बचाएं।', status: 'future' },
      { week: 'सप्ताह 9-10', task: 'हरी मिर्च की पहली तुड़ाई, सिंचाई चक्र जारी रखें।', status: 'future' }
    ]
  },
  Maize: {
    en: [
      { week: 'Week 1-2', task: 'Sowing seeds at 5cm depth, applying basal fertilizer.', status: 'completed' },
      { week: 'Week 3-4', task: 'Thinning plants, first weeding, monitoring fall armyworm.', status: 'current' },
      { week: 'Week 5-6', task: 'Knee-high stage: apply nitrogen fertilizer, earth up soil.', status: 'future' },
      { week: 'Week 7-8', task: 'Tasseling stage: ensure maximum soil moisture, check pests.', status: 'future' },
      { week: 'Week 9-10', task: 'Harvesting green cobs for roasting or dry cobs when grains dent.', status: 'future' }
    ],
    kn: [
      { week: 'ವಾರ 1-2', task: '5 ಸೆಂ.ಮೀ ಆಳದಲ್ಲಿ ಬೀಜ ಬಿತ್ತನೆ, ಮೂಲ ರಸಗೊಬ್ಬರ ಅನ್ವಯಿಸುವುದು.', status: 'completed' },
      { week: 'ವಾರ 3-4', task: 'ಸಸಿಗಳನ್ನು ತೆಳುಗೊಳಿಸುವುದು, ಮೊದಲ ಕಳೆ ಕೀಳುವುದು, ಕತ್ತರಿ ಹುಳು ಪರಿಶೀಲನೆ.', status: 'current' },
      { week: 'ವಾರ 5-6', task: 'ಮೊಣಕಾಲು ಎತ್ತರದ ಹಂತ: ಸಾರಜನಕ ಗೊಬ್ಬರ ಅನ್ವಯಿಸಿ, ಮಣ್ಣು ಏರಿಸಿ.', status: 'future' },
      { week: 'ವಾರ 7-8', task: 'ತೆನೆ ಬರುವ ಹಂತ: ಗರಿಷ್ಠ ಮಣ್ಣಿನ ತೇವಾಂಶ ಖಚಿತಪಡಿಸಿ, ಕೀಟಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.', status: 'future' },
      { week: 'ವಾರ 9-10', task: 'ಹುರಿಯಲು ಹಸಿರು ತೆನೆಗಳ ಕೊಯ್ಲು ಅಥವಾ ಧಾನ್ಯಗಳು ಒಣಗಿದಾಗ ಒಣ ತೆನೆಗಳ ಕೊಯ್ಲು.', status: 'future' }
    ],
    hi: [
      { week: 'सप्ताह 1-2', task: '5 सेमी गहराई पर बीज बोना, आधार उर्वरक डालना।', status: 'completed' },
      { week: 'सप्ताह 3-4', task: 'पौधों को विरल करना, पहली निराई, फॉल आर्मीवर्म की निगरानी।', status: 'current' },
      { week: 'सप्ताह 5-6', task: 'घुटने की ऊंचाई का चरण: नाइट्रोजन उर्वरक डालें, मिट्टी चढ़ाएं।', status: 'future' },
      { week: 'सप्ताह 7-8', task: 'नरमंजर (टैसलिंग) अवस्था: अधिकतम मिट्टी की नमी सुनिश्चित करें।', status: 'future' },
      { week: 'सप्ताह 9-10', task: 'भुट्टे भूनने के लिए हरी कटाई या सूखने पर दानों की तुड़ाई।', status: 'future' }
    ]
  }
};

export function CropSelector({ 
  language, 
  selected, 
  onSelect, 
  onBack 
}: { 
  language: string; 
  selected: string; 
  onSelect: (crop: string, image?: string) => void; 
  onBack: () => void; 
}) {
  const [isOther, setIsOther] = useState(selected && !COMMON_CROPS.includes(selected));
  const [customCrop, setCustomCrop] = useState(isOther ? selected : '');
  const [managerCrop, setManagerCrop] = useState<string | null>(null);
  const [managerTab, setManagerTab] = useState<'dashboard' | 'planner'>('dashboard');

  const [prevManagerCrop, setPrevManagerCrop] = useState<string | null>(managerCrop);
  if (managerCrop !== prevManagerCrop) {
    setPrevManagerCrop(managerCrop);
    if (!managerCrop) {
      setManagerTab('dashboard');
    }
  }
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<any>(null);
  const [isScanningCrop, setIsScanningCrop] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ detectedCrop: string; confidence: number; explanation: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string; isRainingNext24h: boolean } | null>(null);

  const lang = (language as Language) || 'en';
  const t = UI_STRINGS[lang] || UI_STRINGS.en;
  const m = MANAGER_STRINGS[lang] || MANAGER_STRINGS.en;

  useEffect(() => {
    const stored = localStorage.getItem('forkisan_weather');
    const timer = setTimeout(() => {
      if (stored) {
        try {
          setWeather(JSON.parse(stored));
        } catch (e) {}
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (crop: string) => {
    onSelect(crop);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCrop.trim()) {
      onSelect(customCrop.trim());
    }
  };

  const handleCropFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
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
        setScanPreview(base64Img);
        runCropClassifier(base64Img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const runCropClassifier = async (base64Img: string) => {
    setIsScanningCrop(true);
    setScanStatus(lang === 'kn' ? 'ಬೆಳೆ ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...' : lang === 'hi' ? 'फसल की पहचान की जा रही है...' : 'Identifying crop leaf...');
    setScanResult(null);
    setScanError(null);

    try {
      const res = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, image: base64Img })
      });
      
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setScanResult(data);
      setScanStatus(lang === 'kn' ? 'ಬೆಳೆ ಪತ್ತೆಯಾಗಿದೆ!' : lang === 'hi' ? 'फसल मिल गई!' : 'Crop Identified!');
      
      scanTimeoutRef.current = setTimeout(() => {
        setIsScanningCrop(false);
        setScanPreview(null);
        if (data.detectedCrop && COMMON_CROPS.includes(data.detectedCrop)) {
          setManagerCrop(data.detectedCrop);
          onSelect(data.detectedCrop, base64Img);
        } else if (data.detectedCrop === 'Other') {
          setIsOther(true);
        } else {
          onSelect(data.detectedCrop, base64Img);
        }
      }, 2500);
      
    } catch (err: any) {
      console.error(err);
      setScanError(lang === 'kn' ? 'ಬೆಳೆ ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' : lang === 'hi' ? 'फसल की पहचान नहीं हो सकी। कृपया पुनः प्रयास करें।' : 'Could not identify crop. Please try again.');
    }
  };

  const getBlightRiskText = (crop: string) => {
    if (weather) {
      const cropRisks = WEATHER_RISK_STRINGS[lang]?.[crop];
      if (cropRisks) {
        if (weather.isRainingNext24h) {
          return cropRisks.highRainText;
        }
        if (weather.temp > 30) {
          return cropRisks.hotDryText;
        }
      }
    }
    switch (crop) {
      case 'Tomato': return m.riskTomato;
      case 'Paddy': return m.riskPaddy;
      case 'Ragi': return m.riskRagi;
      case 'Chilli': return m.riskChilli;
      case 'Maize': return m.riskMaize;
      default: return m.defaultRisk;
    }
  };

  const getBlightRiskLevel = (crop: string) => {
    if (weather) {
      if (weather.isRainingNext24h) {
        return { level: lang === 'kn' ? 'ಹೆಚ್ಚಿನ ಅಪಾಯ' : lang === 'hi' ? 'उच्च जोखिम' : 'High Risk', color: 'text-red-600 bg-red-50 border-red-100' };
      }
      if (weather.temp > 30 && (crop === 'Chilli' || crop === 'Tomato' || crop === 'Maize')) {
        return { level: lang === 'kn' ? 'ಹೆಚ್ಚಿನ ಅಪಾಯ' : lang === 'hi' ? 'उच्च जोखिम' : 'High Risk', color: 'text-red-600 bg-red-50 border-red-100' };
      }
    }
    if (crop === 'Tomato' || crop === 'Chilli') {
      return { level: m.modRisk, color: 'text-amber-600 bg-amber-50 border-amber-100' };
    }
    return { level: m.lowRisk, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto flex flex-col pt-4 relative"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 self-start transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">{t.back || 'Back'}</span>
      </button>

      {/* Auto-crop Scan Header Card */}
      <div className="w-full mb-8">
        <div className="w-full p-5 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--brand-primary)] bg-[var(--brand-light)] text-[var(--brand-deep)] shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-base md:text-lg flex items-center gap-1.5">
                {lang === 'kn' ? 'ಫೋಟೋ ಮೂಲಕ ಬೆಳೆ ಗುರುತಿಸಿ' : lang === 'hi' ? 'फोटो द्वारा फसल पहचानें' : 'Scan Leaf to Identify Crop'}
                <span className="text-[10px] bg-[var(--brand-primary)] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">AI</span>
              </h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                {lang === 'kn' ? 'ನಿಮ್ಮ ಬೆಳೆಯ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ, ಕೃಷಿ AI ಬೆಳೆ ಪತ್ತೆ ಮಾಡುತ್ತದೆ.' : lang === 'hi' ? 'अपनी फसल के पत्ते की फोटो लें, AI फसल की पहचान करेगा।' : 'Upload a photo of your leaf and let AI detect which crop it is.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/80 border border-[var(--brand-primary)]/20 px-4 py-3 text-sm font-extrabold text-[var(--brand-deep)] hover:bg-white transition-colors active:scale-[0.98]"
            >
              <Camera className="w-4 h-4 text-[var(--brand-primary)]" />
              {lang === 'kn' ? 'ಕ್ಯಾಮೆರಾ' : lang === 'hi' ? 'कैमरा' : 'Camera'}
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/80 border border-[var(--brand-primary)]/20 px-4 py-3 text-sm font-extrabold text-[var(--brand-deep)] hover:bg-white transition-colors active:scale-[0.98]"
            >
              <ImageIcon className="w-4 h-4 text-[var(--brand-primary)]" />
              {lang === 'kn' ? 'ಗ್ಯಾಲರಿ' : lang === 'hi' ? 'गैलरी' : 'Gallery'}
              <ChevronRight className="w-4 h-4 text-[var(--brand-primary)]" />
            </button>
          </div>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={cameraInputRef}
          onChange={handleCropFileChange} 
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={galleryInputRef}
          onChange={handleCropFileChange} 
        />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center text-balance">
        {t.selectCrop || 'Select your crop'}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {COMMON_CROPS.map((crop) => {
          const isSelected = selected === crop && !isOther;
          const displayName = CROP_TRANSLATIONS[lang]?.[crop] || crop;
          return (
            <motion.button
              key={crop}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsOther(false);
                setManagerCrop(crop); // Open Crop Manager drawer instead of directly selecting
              }}
              className={`relative flex flex-col items-center justify-center p-6 rounded-[var(--radius-lg)] border-2 transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-[var(--brand-deep)]' 
                  : 'border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--brand-primary)]/30'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--brand-primary)] rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <span className="text-4xl mb-2 select-none" role="img" aria-label={crop}>
                {CROP_EMOJIS[crop]}
              </span>
              <span className="font-semibold text-lg">{displayName}</span>
            </motion.button>
          );
        })}
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsOther(true);
            setManagerCrop(null);
          }}
          className={`flex flex-col items-center justify-center p-6 rounded-[var(--radius-lg)] border-2 transition-all duration-200 cursor-pointer ${
            isOther 
              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-[var(--brand-deep)]' 
              : 'border-[var(--border-subtle)] bg-white text-[var(--text-primary)] hover:border-[var(--brand-primary)]/30'
          }`}
        >
          <div className={`w-10 h-10 mb-2 rounded-full flex items-center justify-center border-2 ${isOther ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'border-[var(--text-muted)] text-[var(--text-muted)]'}`}>
            <span className="font-semibold">...</span>
          </div>
          <span className="font-semibold text-lg">{CROP_TRANSLATIONS[lang]?.Other || 'Other'}</span>
        </motion.button>
      </div>

      {isOther && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCustomSubmit}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <input
            type="text"
            value={customCrop}
            onChange={(e) => setCustomCrop(e.target.value)}
            placeholder={t.enterCropName || 'Enter crop name'}
            className="flex-1 px-4 py-4 rounded-[var(--radius-lg)] border-2 border-[var(--border-subtle)] bg-white focus:border-[var(--brand-primary)] focus:outline-none transition-colors text-lg"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!customCrop.trim()}
            className="px-8 py-4 bg-[var(--brand-primary)] text-white rounded-[var(--radius-lg)] font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--brand-deep)] transition-colors active:scale-[0.98] cursor-pointer"
          >
            {t.cropProblem || 'Continue'}
          </button>
        </motion.form>
      )}

      {/* CROP MANAGER BOTTOM DRAWER OVERLAY */}
      <AnimatePresence>
        {managerCrop && (
          <>
            {/* Backdrop Mask */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setManagerCrop(null)}
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[28px] border-t border-[var(--border-subtle)] p-6 md:p-8 shadow-[0_-8px_32px_rgba(23,35,27,0.15)] max-w-2xl mx-auto flex flex-col gap-6"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1.5 bg-[var(--border-subtle)] rounded-full mx-auto -mt-2 mb-1" />

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl" role="img" aria-label={managerCrop}>
                    {CROP_EMOJIS[managerCrop]}
                  </span>
                  <div>
                    <h3 className="font-bold text-2xl text-[var(--text-primary)]">
                       {getLocalizedCropName(managerCrop, lang)} {m.managerTitle}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">ForKisan Smart Dashboard</p>
                  </div>
                </div>
                <button 
                  onClick={() => setManagerCrop(null)}
                  className="p-2 hover:bg-[var(--surface-soft)] text-[var(--text-secondary)] rounded-full transition-colors focus:outline-none"
                  aria-label={m.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex bg-[var(--surface-soft)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-inner">
                <button
                  onClick={() => setManagerTab('dashboard')}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    managerTab === 'dashboard'
                      ? 'bg-white text-[var(--brand-deep)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {lang === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                </button>
                <button
                  onClick={() => setManagerTab('planner')}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    managerTab === 'planner'
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t.taskPlannerTab || 'Task Planner'}
                </button>
              </div>

              {/* Scrollable Content inside Drawer */}
              <div className="flex flex-col gap-5 overflow-y-auto max-h-[50vh] pr-1">
                {managerTab === 'dashboard' ? (
                  <>
                    {/* Weather Driven Blight Risks */}
                    <div className="bg-[var(--surface-soft)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]/65">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-[var(--brand-primary)]" />
                          {m.weatherRisk}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getBlightRiskLevel(managerCrop).color}`}>
                          {getBlightRiskLevel(managerCrop).level}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {getBlightRiskText(managerCrop)}
                      </p>
                    </div>

                    {/* Normal Care Tips */}
                    <div className="bg-white rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
                      <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-1.5 border-b border-[var(--border-subtle)]/40 pb-2">
                        <Info className="w-4 h-4 text-[var(--brand-primary)]" />
                        {m.careTips}
                      </h4>
                      <ul className="space-y-3">
                        {CROP_TIPS[managerCrop]?.[lang]?.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-1.5 flex-shrink-0" />
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  /* Task Planner Tab */
                  <div className="bg-white rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
                    <h4 className="font-bold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-1.5 border-b border-[var(--border-subtle)]/40 pb-2">
                      <Sprout className="w-4 h-4 text-[var(--brand-primary)]" />
                      {lang === 'kn' ? 'ವಾರದ ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ' : lang === 'hi' ? 'साप्ताहिक फसल अनुसूची' : 'Weekly Crop Schedule'}
                    </h4>
                    <div className="relative pl-6 border-l-2 border-[#efede6] space-y-5 ml-2">
                      {CROP_CALENDARS[managerCrop]?.[lang]?.map((item, idx) => {
                        let dotClass = "bg-gray-200 border-gray-300";
                        let itemClass = "opacity-60";
                        let badgeText = "";
                        let badgeClass = "";

                        if (item.status === 'completed') {
                          dotClass = "bg-emerald-500 border-emerald-600 scale-100 ring-4 ring-emerald-50";
                          itemClass = "opacity-75";
                          badgeText = lang === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : lang === 'hi' ? 'पूर्ण' : 'Completed';
                          badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        } else if (item.status === 'current') {
                          dotClass = "bg-[var(--brand-primary)] border-[var(--brand-deep)] scale-110 ring-4 ring-[var(--brand-light)] animate-pulse";
                          itemClass = "opacity-100 font-bold scale-[1.01]";
                          badgeText = lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಹಂತ' : lang === 'hi' ? 'सक्रिय' : 'Active Stage';
                          badgeClass = "bg-[var(--brand-light)] text-[var(--brand-deep)] border-[var(--brand-primary)]/20";
                        } else {
                          badgeText = lang === 'kn' ? 'ಮುಂಬರುವ' : lang === 'hi' ? 'आगामी' : 'Upcoming';
                          badgeClass = "bg-gray-50 text-gray-500 border-gray-100";
                        }

                        return (
                          <div key={idx} className={`relative flex flex-col gap-1 transition-all ${itemClass}`}>
                            {/* Bullet indicator */}
                            <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${dotClass}`} />
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[var(--brand-deep)] uppercase tracking-wider">{item.week}</span>
                              <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${badgeClass}`}>{badgeText}</span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.task}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Start Diagnostics CTA */}
              <button 
                onClick={() => {
                  handleSelect(managerCrop);
                  setManagerCrop(null);
                }}
                className="w-full py-4.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-deep)] text-white rounded-[var(--radius-lg)] font-bold text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer mt-2"
              >
                <Mic className="w-5 h-5" />
                {m.startDiagnosis}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CROP IDENTIFICATION SCANNING OVERLAY */}
      <AnimatePresence>
        {isScanningCrop && scanPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-white"
          >
            <div className="w-full max-w-md flex flex-col items-center gap-6">
              <h3 className="text-xl font-bold uppercase tracking-wider text-[var(--brand-light)] animate-pulse">
                {lang === 'kn' ? 'ಕೃಷಿ AI ಬೆಳೆ ಪತ್ತೆಕಾರಕ' : lang === 'hi' ? 'कृषि AI फसल पहचानकर्ता' : 'Kisan AI Crop Detector'}
              </h3>
              
              <div className="relative w-full aspect-square max-w-sm rounded-[24px] overflow-hidden border-2 border-[var(--brand-primary)] bg-black shadow-[0_0_30px_rgba(30,107,75,0.4)]">
                <img src={scanPreview} className="w-full h-full object-cover" alt="Uploaded leaf preview" />
                
                {/* Laser scan line */}
                {!scanResult && !scanError && (
                  <div className="absolute left-0 w-full h-[4px] bg-emerald-400 opacity-90 shadow-[0_0_12px_#1e6b4b] animate-scan z-20" />
                )}

                {/* Spot detections / scanner boxes */}
                {!scanResult && !scanError && (
                  <>
                    <div className="absolute top-[30%] left-[40%] w-8 h-8 border border-dashed border-emerald-400 rounded-lg flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    </div>
                    <div className="absolute top-[60%] left-[65%] w-10 h-10 border border-dashed border-emerald-400 rounded-lg flex items-center justify-center animate-pulse [animation-delay:0.3s]">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    </div>
                  </>
                )}

                {/* Success checkmark or error alert */}
                {scanResult && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-[var(--brand-deep)]/80 flex flex-col items-center justify-center gap-3 p-6 text-center z-30"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-emerald-400">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div className="font-extrabold text-2xl text-emerald-400">
                      {getLocalizedCropName(scanResult.detectedCrop, lang)}
                    </div>
                    {scanResult.confidence && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        {Math.round(scanResult.confidence * 100)}% Confidence
                      </span>
                    )}
                    {scanResult.explanation && (
                      <p className="text-xs text-gray-200 mt-2 font-medium leading-relaxed max-w-[280px]">
                        {scanResult.explanation}
                      </p>
                    )}
                  </motion.div>
                )}

                {scanError && (
                  <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center gap-3 p-6 text-center z-30">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border border-red-500">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-semibold text-red-200">{scanError}</p>
                    <button 
                      onClick={() => {
                        setIsScanningCrop(false);
                        setScanPreview(null);
                      }}
                      className="mt-4 px-5 py-2.5 bg-white text-red-950 rounded-full font-bold hover:bg-gray-100 transition-colors"
                    >
                      {lang === 'kn' ? 'ಮುಚ್ಚಿ' : lang === 'hi' ? 'बंद करें' : 'Close'}
                    </button>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {!scanError && (
                <div className="flex items-center gap-3 text-base font-semibold text-gray-200 mt-2 animate-pulse">
                  {!scanResult && <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />}
                  <span>{scanStatus}</span>
                </div>
              )}

              {/* Cancel / Wrong Crop Button */}
              <button
                onClick={() => {
                  if (scanTimeoutRef.current) {
                    clearTimeout(scanTimeoutRef.current);
                    scanTimeoutRef.current = null;
                  }
                  setIsScanningCrop(false);
                  setScanPreview(null);
                  setScanResult(null);
                }}
                className="mt-4 px-6 py-2.5 bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer z-40"
              >
                <X className="w-4 h-4" />
                {lang === 'kn' ? 'ತಪ್ಪು ಬೆಳೆ / ರದ್ದುಮಾಡಿ' : lang === 'hi' ? 'गलत फसल / रद्द करें' : 'Wrong Crop / Cancel'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

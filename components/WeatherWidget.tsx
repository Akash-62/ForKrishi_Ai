import { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, CloudFog, Loader2, MapPin, TrendingUp, TrendingDown, Mic, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UI_STRINGS, CROP_TRANSLATIONS, Language } from '@/lib/translations';

interface WeatherData {
  temp: number;
  condition: string;
  isRainingNext24h: boolean;
}

const MANDI_PRICES = [
  { name: 'Tomato', nameKn: 'ಟೊಮೆಟೊ', nameHi: 'टमाटर', price: '₹2,200', change: '+4.2%', upward: true, points: '10,12,8,15,22,18,25' },
  { name: 'Paddy', nameKn: 'ಭತ್ತ', nameHi: 'धान', price: '₹1,950', change: '+1.8%', upward: true, points: '5,10,12,11,14,18,19' },
  { name: 'Chilli', nameKn: 'ಮೆಣಸಿನಕಾಯಿ', nameHi: 'मिर्च', price: '₹7,400', change: '-2.5%', upward: false, points: '25,24,20,22,18,16,15' },
];

const Sparkline = ({ points, upward }: { points: string; upward: boolean }) => {
  const vals = points.split(',').map(Number);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const width = 60;
  const height = 20;
  const step = width / (vals.length - 1);
  
  const coords = vals.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height + 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-[60px] h-[24px] overflow-visible" stroke={upward ? '#2F855A' : '#B42318'} strokeWidth="1.5" fill="none">
      <polyline points={coords} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export function WeatherWidget({ language = 'en' }: { language?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Your Location');
  const lang = (language as Language) || 'en';
  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const startVoiceQuery = () => {
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
      setVoiceFeedback(lang === 'kn' ? 'ಕೇಳುತ್ತಿದ್ದೇನೆ...' : lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening for crop name...');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      processVoiceQuery(text);
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

  const processVoiceQuery = (spokenText: string) => {
    const matchedCrop = MANDI_PRICES.find(crop => {
      const enMatch = spokenText.includes(crop.name.toLowerCase());
      const knMatch = spokenText.includes(crop.nameKn);
      const hiMatch = spokenText.includes(crop.nameHi);
      return enMatch || knMatch || hiMatch;
    });

    if (matchedCrop) {
      const cropNameTrans = lang === 'kn' ? matchedCrop.nameKn : lang === 'hi' ? matchedCrop.nameHi : matchedCrop.name;
      let responseText = '';
      if (lang === 'kn') {
        responseText = `${cropNameTrans} ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ${matchedCrop.price} ರೂಪಾಯಿಗಳು. ಇದು ${matchedCrop.change.replace('+', '')} ಹೆಚ್ಚಾಗಿದೆ.`;
        if (!matchedCrop.upward) {
          responseText = `${cropNameTrans} ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ${matchedCrop.price} ರೂಪಾಯಿಗಳು. ಇದು ${matchedCrop.change.replace('-', '')} ಕಡಿಮೆಯಾಗಿದೆ.`;
        }
      } else if (lang === 'hi') {
        responseText = `${cropNameTrans} का मंडी भाव ${matchedCrop.price} रुपये प्रति क्विंटल है। इसमें ${matchedCrop.change.replace('+', '')} की वृद्धि हुई है।`;
        if (!matchedCrop.upward) {
          responseText = `${cropNameTrans} का मंडी भाव ${matchedCrop.price} रुपये प्रति क्विंटल है। इसमें ${matchedCrop.change.replace('-', '')} की गिरावट आई है।`;
        }
      } else {
        responseText = `The mandi price for ${cropNameTrans} is ${matchedCrop.price} per quintal. It has changed by ${matchedCrop.change}.`;
      }

      setVoiceFeedback(`"${spokenText}" → ${responseText}`);
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(responseText);
        let langCode = 'en-IN';
        if (lang === 'kn') langCode = 'kn-IN';
        if (lang === 'hi') langCode = 'hi-IN';
        utterance.lang = langCode;

        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.replace('_', '-').startsWith(langCode));
        if (matchedVoice) utterance.voice = matchedVoice;
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      const notFoundText = lang === 'kn' 
        ? `ಕ್ಷಮಿಸಿ, "${spokenText}" ಬೆಳೆಗೆ ಬೆಲೆ ಸಿಗಲಿಲ್ಲ. ಟೊಮೆಟೊ, ಭತ್ತ ಅಥವಾ ಮೆಣಸಿನಕಾಯಿ ಎಂದು ಹೇಳಿ.`
        : lang === 'hi' 
          ? `क्षमा करें, "${spokenText}" के लिए भाव नहीं मिला। टमाटर, धान या मिर्च बोलें।`
          : `Sorry, could not find price for "${spokenText}". Say Tomato, Paddy, or Chilli.`;

      setVoiceFeedback(notFoundText);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(notFoundText);
        let langCode = 'en-IN';
        if (lang === 'kn') langCode = 'kn-IN';
        if (lang === 'hi') langCode = 'hi-IN';
        utterance.lang = langCode;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => setVoiceFeedback(null), 5000);
    }
  };

  useEffect(() => {
    const storedWeather = localStorage.getItem('forkisan_weather');
    const storedLocation = localStorage.getItem('forkisan_location_name');
    
    const timer = setTimeout(() => {
      if (storedWeather) {
        try {
          setWeather(JSON.parse(storedWeather));
        } catch (e) {}
      }
      if (storedLocation) {
        setLocationName(storedLocation);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const fetchWeather = (lat: number, lon: number) => {
    setLoading(true);
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
      .then(res => res.json())
      .then(data => {
        if (data.city || data.locality) {
          const loc = data.city || data.locality;
          setLocationName(loc);
          localStorage.setItem('forkisan_location_name', loc);
        }
      })
      .catch(() => {});

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability&timezone=auto`)
      .then(res => res.json())
      .then(data => {
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        
        let condition = "Clear";
        if (code >= 1 && code <= 3) condition = "Cloudy";
        if (code >= 45 && code <= 48) condition = "Foggy";
        if (code >= 51 && code <= 67) condition = "Rainy";
        if (code >= 71 && code <= 82) condition = "Snowy";
        if (code >= 95) condition = "Stormy";

        const next24hRain = data.hourly.precipitation_probability.slice(0, 24);
        const isRainingNext24h = next24hRain.some((prob: number) => prob > 50);

        setWeather({ temp, condition, isRainingNext24h });
        localStorage.setItem('forkisan_weather', JSON.stringify({ temp, condition, isRainingNext24h }));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load weather");
        setLoading(false);
      });
  };

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Rainy': case 'Stormy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'Cloudy': return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'Foggy': return <CloudFog className="w-8 h-8 text-gray-400" />;
      default: return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <div className="w-full bg-white rounded-[28px] border border-[#efebe0] p-6 shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)] mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
          <span className="font-bold text-[var(--text-primary)]">{locationName}</span>
        </div>
      </div>
      
      <div className="mt-4">
        {!weather && !loading && !error && (
          <button 
            onClick={requestLocation}
            className="w-full py-3 bg-[var(--brand-light)] border border-[var(--brand-primary)]/20 text-[var(--brand-deep)] font-extrabold rounded-xl hover:bg-[var(--brand-primary)]/10 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <CloudRain className="w-4 h-4 text-[var(--brand-primary)] animate-bounce" />
            {lang === 'kn' ? 'ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆ ಅಪಾಯ ನೋಡಿ' : lang === 'hi' ? 'मौसम और फसल जोखिम देखें' : 'Show Weather & Crop Risks'}
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-primary)]" />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 py-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">{error}</span>
            <button onClick={requestLocation} className="text-xs border border-red-200 px-3 py-1 rounded bg-white hover:bg-red-50 font-bold cursor-pointer active:scale-95 transition-all">Retry</button>
          </div>
        )}

        {weather && !loading && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            {/* Weather row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 border-b border-[#efede6] pb-4">
              <div className="flex items-center gap-4 flex-1">
                {getWeatherIcon(weather.condition)}
                <div>
                  <div className="text-3xl font-black text-[var(--text-primary)]">{weather.temp}°C</div>
                  <div className="text-sm font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">{weather.condition}</div>
                </div>
              </div>
              
              {weather.isRainingNext24h ? (
                <div className="mt-3 sm:mt-0 bg-red-50 border border-red-100 rounded-2xl p-3.5 flex-1 flex flex-col justify-center shadow-sm">
                  <span className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    {lang === 'kn' ? 'ಮಳೆ ನಿರೀಕ್ಷಿತ' : lang === 'hi' ? 'बारिश की संभावना' : 'Rain Expected'}
                  </span>
                  <p className="text-[10px] text-red-950 font-semibold leading-relaxed">
                    {lang === 'kn' 
                      ? 'ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸಬೇಡಿ, ಅದು ನೀರಿನಲ್ಲಿ ತೊಳೆದುಹೋಗಬಹುದು.' 
                      : lang === 'hi' 
                        ? 'उर्वरक या कीटनाशक न छिड़कें, वे धुल सकते हैं।' 
                        : 'Avoid spraying fertilizers today. High probability of runoff.'}
                  </p>
                </div>
              ) : (
                <div className="mt-3 sm:mt-0 bg-[#f0faf4] border border-[#cbebd6] rounded-2xl p-3.5 flex-1 flex flex-col justify-center shadow-sm">
                  <span className="text-[10px] font-black text-[#1e6b4b] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === 'kn' ? 'ಸ್ಪಷ್ಟ ಹವಾಮಾನ' : lang === 'hi' ? 'साफ़ मौसम' : 'Clear Weather'}
                  </span>
                  <p className="text-[10px] text-emerald-950 font-semibold leading-relaxed">
                    {lang === 'kn' 
                      ? 'ಬೆಳೆ ಸಿಂಪಡಣೆ ಅಥವಾ ಕೊಯ್ಲು ಮಾಡಲು ಅನುಕೂಲಕರವಾದ ದಿನ.' 
                      : lang === 'hi' 
                        ? 'छिड़काव या फसल कटाई के लिए अनुकूल मौसम।' 
                        : 'Favorable conditions for scheduled harvesting or spraying.'}
                  </p>
                </div>
              )}
            </div>

            {/* Local Mandi Prices Board */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3.5">
                <h5 className="font-extrabold text-[10px] text-[#7C8B80] uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[var(--brand-primary)]" />
                  {t.mandiTitle || 'Mandi Market Prices (per Quintal)'}
                </h5>
                <button
                  onClick={startVoiceQuery}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isListening 
                      ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse' 
                      : 'bg-[#FAF9F5] hover:bg-[#efede6] text-[var(--brand-primary)] border-[#efede6]'
                  }`}
                  title={lang === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಬೆಲೆ ಕೇಳಿ' : lang === 'hi' ? 'आवाज से भाव पूछें' : 'Query prices by voice'}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Voice Feedback Display */}
              <AnimatePresence>
                {voiceFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mb-3.5 p-3.5 bg-[#f0faf4] border border-[#cbebd6] rounded-2xl text-[11px] font-bold text-emerald-950 flex items-start gap-2 shadow-sm"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 animate-bounce" />
                    <span className="leading-normal">{voiceFeedback}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-1 gap-2.5">
                {MANDI_PRICES.map((crop) => {
                  const cropName = lang === 'kn' ? crop.nameKn : lang === 'hi' ? crop.nameHi : crop.name;
                  return (
                    <div key={crop.name} className="flex items-center justify-between bg-[#FAF9F5] border border-[#efede6] rounded-2xl p-3 hover:scale-[1.01] transition-transform duration-200 shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-[var(--text-primary)]">{cropName}</span>
                        <span className="text-[9px] text-[#7C8B80] font-bold uppercase tracking-wider">APMC Local Mandi</span>
                      </div>
                      
                      {/* Trend Sparkline */}
                      <div className="hidden sm:block">
                        <Sparkline points={crop.points} upward={crop.upward} />
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="font-black text-sm text-[var(--text-primary)]">{crop.price}</span>
                        <span className={`text-[10px] font-extrabold flex items-center gap-0.5 ${crop.upward ? 'text-emerald-700' : 'text-red-700'}`}>
                          {crop.upward ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {crop.change}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

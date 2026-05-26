import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, ShieldCheck, Sparkles, Camera, Bookmark, WifiOff, Check, ChevronRight, Languages, Leaf, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { UI_STRINGS, Language } from '@/lib/translations';
import { WeatherWidget } from './WeatherWidget';
import Stack from './Stack';

// Interactive Card shell matching design screenshot styles
interface InteractiveCardProps {
  children: ReactNode;
}

function InteractiveCard({ children }: InteractiveCardProps) {
  return (
    <div className="relative w-full h-[400px] cursor-pointer select-none group">
      {/* Dynamic tactile shadow under the card */}
      <div className="absolute inset-0 bg-[#ebe9dd] rounded-[28px] -rotate-2 scale-102 transition-transform duration-300 group-hover:scale-103 group-hover:rotate-0 z-0"></div>
      
      <div className="relative w-full h-full z-10 transition-transform duration-300 group-hover:scale-[1.01]">
        {children}
      </div>
    </div>
  );
}

// Custom hook to drive demo step cycling inside each card
function useDemoSequence(numSteps: number, intervalMs: number = 4000) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % numSteps);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [numSteps, intervalMs]);

  return step;
}

// Simulated animated audio waveform for Voice Input Demo (Pure & Deterministic)
const WaveformBarsDemo = () => {
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
const VoiceCardDemo = ({ onStart }: { onStart: () => void }) => {
  const step = useDemoSequence(3, 4000);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <Mic className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">AI VOICE</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">Voice Diagnosis</p>
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
              LISTENING
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
              TRANSLATING
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
              RESOLVED
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
              <WaveformBarsDemo />
              <div className="text-center">
                <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider mb-1">Farmer Spoke:</p>
                <p className="text-xs text-[#1E6B4B] font-extrabold italic leading-relaxed">“ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ ಮತ್ತು ಕೀಟಗಳು...”</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Sparkles className="w-4 h-4 text-[#1E6B4B] fill-[#1E6B4B] animate-pulse" />
                <span className="text-[#123C2C] text-[10px] font-bold uppercase tracking-wider">Ready to record</span>
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
                <p className="text-[9px] text-[#7C8B80] font-bold uppercase tracking-wider mb-1">AI Language Parser</p>
                <p className="text-xs text-[#5d665f] font-semibold">Translate: &quot;My leaves are yellowing and insects are visible...&quot;</p>
              </div>
              <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider">Processing Audio...</span>
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
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase border border-amber-200">Medium</span>
                <h4 className="font-extrabold text-sm text-[#17231B]">Whitefly Infestation</h4>
              </div>
              <p className="text-xs text-[#5d665f] font-semibold leading-relaxed">Common sap-sucking pest attack detected.</p>
              
              <div className="bg-white p-2.5 rounded-xl border border-[#efede6] shadow-sm w-full mt-1.5 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1E6B4B] mt-1.5 flex-shrink-0" />
                <p className="text-[10px] text-[#123C2C] font-extrabold leading-normal">Recommendation: Spray organic neem oil at root level.</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2 justify-center w-full">
                <Sparkles className="w-3.5 h-3.5 text-[#1E6B4B] fill-[#1E6B4B]" />
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">Diagnosis complete</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>Voice help assistant</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>Start Voice Help</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 2. VISUAL PHOTO SCANNER FRONT (Cycles: Scanning -> Analyzing spots -> Real-time Output query result)
const ScanCardDemo = ({ onStart }: { onStart: () => void }) => {
  const step = useDemoSequence(3, 4000);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <Camera className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">AI SCANNER</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">Diagnosis Demo</p>
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
              SCANNING
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
              ANALYZING
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
              RESOLVED
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
                <img src="/tomato_leaf.png" className="w-full h-full object-cover select-none pointer-events-none" alt="Leaf Scanner Demo" />
                
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
                <span className="text-[#123C2C] text-[10px] font-bold uppercase tracking-wider">AI Spot Detection Active</span>
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
                <img src="/tomato_leaf.png" className="w-full h-full object-cover select-none pointer-events-none filter brightness-90" alt="Leaf Scanner Demo" />
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
                  <span>Checking spot patterns</span>
                  <span className="text-blue-700 animate-pulse">Running Queries...</span>
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
                <img src="/tomato_leaf.png" className="w-full h-full object-cover select-none pointer-events-none" alt="Leaf Scanner Demo" />
                
                {/* Bounding Box for infected area */}
                <div className="absolute top-[20%] left-[22%] w-[58%] h-[55%] border-2 border-amber-500 rounded-lg shadow-[0_0_8px_rgba(245,158,11,0.5)] z-20">
                  <span className="absolute top-0 left-0 bg-amber-500 text-white font-black text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-br-md select-none">
                    Early Blight Spot: 94%
                  </span>
                </div>
              </div>

              <div className="w-full mt-2.5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-[var(--status-serious)] text-[8px] font-extrabold uppercase border border-red-200">Medium severity</span>
                  <h4 className="font-extrabold text-[11px] text-[#17231B]">Early Blight Fungal Spots</h4>
                </div>
                <p className="text-[10px] text-[#5d665f] font-semibold leading-relaxed">Tomato early blight lesions identified. Avoid sprinkler watering and apply copper oxide.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>Demo leaf analysis</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>Scan Leaf Now</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 3. ACTION PLANS FRONT (Cycles: Compiling lists -> Action Warning output)
const RemedyCardDemo = ({ onStart }: { onStart: () => void }) => {
  const step = useDemoSequence(2, 4500);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">AI REMEDY</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">Clear Action Plans</p>
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
              COMPILING
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
              ALERT
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
                { text: 'Verify undersides of leaves', checked: true },
                { text: 'Irrigate only at root level', checked: true },
                { text: 'Isolate infected crops', checked: false }
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
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">Treatment Ready</span>
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
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[9px] font-extrabold uppercase border border-red-200">Serious</span>
                <h4 className="font-extrabold text-sm text-[#17231B]">Chilli Leaf Curl Virus</h4>
              </div>
              
              <div className="bg-red-50/40 rounded-[18px] p-3 border border-red-100 w-full flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-[10px] uppercase">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>What to avoid</span>
                </div>
                <ul className="text-[10px] text-red-950 space-y-1.5 font-semibold mt-1">
                  <li className="flex items-start gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    Do not use overhead sprinklers (spreads virus).
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    Avoid applying nitrogen fertilizers for 7 days.
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-1.5 mt-1 justify-center w-full">
                <Sparkles className="w-3 h-3 text-red-700 fill-red-700" />
                <span className="text-red-900 text-[9px] font-bold uppercase tracking-wider">Critical Actions Compiled</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>Treatment guides</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>Start Diagnosis</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 4. SAVED OFFLINE GUIDES FRONT (Cycles: Syncing Cloud -> Offline Access Guides Stored)
const OfflineCardDemo = ({ onNavigate }: { onNavigate?: (screen: any) => void }) => {
  const step = useDemoSequence(2, 4500);

  return (
    <div className="w-full h-full bg-white rounded-[28px] border border-[#efebe0] p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[-10px_10px_0px_#ebe9dd,0_10px_30px_rgba(0,0,0,0.04)]">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-[#efede6]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#eef7f2] flex items-center justify-center shadow-sm">
            <Bookmark className="w-6 h-6 text-[#1E6B4B]" />
          </div>
          <div>
            <p className="text-[10px] text-[#7C8B80] font-bold uppercase tracking-wider">LOCAL DATABASE</p>
            <p className="font-extrabold text-lg text-[#17231B] leading-tight">Saved Offline Guides</p>
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
              SYNCING
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
              OFFLINE READY
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
                <p className="text-xs font-extrabold text-[#123C2C]">Paddy Guide Saved</p>
                <p className="text-[10px] text-[#5d665f] mt-1 font-semibold">Syncing advisories for crop offline mode...</p>
              </div>
              <div className="flex items-center gap-1.5 mt-2 justify-center w-full">
                <Sparkles className="w-3.5 h-3.5 text-[#1E6B4B] fill-[#1E6B4B] animate-pulse" />
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">Local DB Synced</span>
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
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase border border-emerald-200">Low Risk</span>
                <h4 className="font-extrabold text-sm text-[#17231B]">Paddy Blast Disease</h4>
              </div>
              <p className="text-xs text-[#5d665f] font-semibold leading-relaxed">Weather risk detected. Keep water depth steady at 2 inches.</p>
              
              <div className="bg-[#FAF9F5] rounded-[18px] p-2.5 border border-[#efede6] w-full flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide">Device Cache Active (4 Advisories)</span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 justify-center w-full">
                <Sparkles className="w-3 h-3 text-[#1E6B4B] fill-[#1E6B4B]" />
                <span className="text-[#123C2C] text-[9px] font-bold uppercase tracking-wider">Offline Cache Enabled</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-sm text-[#5d665f] pt-2 font-medium px-2">
        <span>Saved crop advice</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.('saved');
          }}
          className="flex items-center gap-1 text-[#1E6B4B] font-extrabold cursor-pointer hover:underline"
        >
          <span>Open Saved Guides</span>
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
  language = 'en'
}: { 
  onStart: () => void; 
  onUpdates: () => void; 
  onNavigate?: (screen: any) => void;
  language?: string;
}) {
  const lang = (language as Language) || 'en';
  const t = UI_STRINGS[lang] || UI_STRINGS.en;
  const [selectedFeature, setSelectedFeature] = useState<number>(0);

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
            Voice-First · India-First · AI-Powered
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight tracking-tight mb-6">
            Speak your crop problem. <br className="hidden md:block"/>
            <span className="text-[var(--brand-primary)]">Get simple guidance.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 leading-relaxed max-w-lg font-medium">
            A voice-first crop help assistant for Indian farmers. Choose your language, select your crop, and get quick, safe, farmer-friendly advice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full mb-10">
            <button 
              onClick={onStart}
              className="flex-1 sm:flex-none justify-center bg-[var(--brand-primary)] text-white px-8 py-4 rounded-[var(--radius-lg)] font-bold text-lg flex items-center gap-2 hover:bg-[var(--brand-deep)] transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Mic className="w-5 h-5" />
              Start Crop Help
            </button>
            
            <button 
              onClick={onUpdates}
              className="flex-1 sm:flex-none justify-center bg-white border border-[var(--border-subtle)] text-[var(--text-primary)] px-8 py-4 rounded-[var(--radius-lg)] font-bold text-lg flex items-center gap-2 hover:bg-[var(--surface-soft)] transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            >
              View Farmer Updates
            </button>
          </div>

          <div className="flex flex-row justify-between sm:justify-start sm:gap-6 text-[10px] min-[360px]:text-xs sm:text-sm text-[var(--text-secondary)] font-bold w-full mb-6 flex-nowrap">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-primary)] flex-shrink-0" /> Voice-first
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-primary)] flex-shrink-0" /> Local language
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--brand-primary)] flex-shrink-0" /> Simple next steps
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
        <div className="w-full lg:max-w-[40%] h-[420px] relative mt-8 lg:mt-0 flex-shrink-0 select-none">
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
                <VoiceCardDemo onStart={onStart} />
              </InteractiveCard>,
              <InteractiveCard key={1}>
                <ScanCardDemo onStart={onStart} />
              </InteractiveCard>,
              <InteractiveCard key={2}>
                <RemedyCardDemo onStart={onStart} />
              </InteractiveCard>,
              <InteractiveCard key={3}>
                <OfflineCardDemo onNavigate={onNavigate} />
              </InteractiveCard>
            ]}
          />
        </div>
      </div>
    </motion.div>
  );
}

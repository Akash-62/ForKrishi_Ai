import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function WaveformVisualizer({ isListening }: { isListening: boolean }) {
  const [levels, setLevels] = useState<number[]>([10, 10, 10, 10, 10]);

  const [prevIsListening, setPrevIsListening] = useState(isListening);
  if (isListening !== prevIsListening) {
    setPrevIsListening(isListening);
    if (!isListening) {
      setLevels([10, 10, 10, 10, 10]);
    }
  }

  useEffect(() => {
    if (!isListening) {
      return;
    }

    let animationFrameId: number;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let mediaStream: MediaStream | null = null;

    // Mock fallback interval
    let mockInterval: any = null;

    const startMonitoring = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Use standard or webkit prefixed AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error("AudioContext not supported");
        }

        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.7;

        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateWaveform = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);

          // Downsample to 5 bars
          const newLevels = [];
          const step = Math.floor(bufferLength / 5);
          for (let i = 0; i < 5; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
              sum += dataArray[i * step + j];
            }
            const average = sum / step;
            // Map 0-255 to appropriate heights (e.g. 8px min, 36px max)
            const height = 8 + (average / 255) * 28;
            newLevels.push(height);
          }
          setLevels(newLevels);
          animationFrameId = requestAnimationFrame(updateWaveform);
        };

        updateWaveform();
      } catch (err) {
        console.warn('Failed to access microphone for visualizer. Falling back to simulated animation.', err);
        // Fallback simulated animation
        mockInterval = setInterval(() => {
          setLevels(Array(5).fill(0).map(() => 8 + Math.random() * 24));
        }, 150);
      }
    };

    startMonitoring();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mockInterval) clearInterval(mockInterval);
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    };
  }, [isListening]);

  return (
    <div className="flex justify-center items-center gap-1.5 h-10">
      {levels.map((height, i) => (
        <motion.div
          key={i}
          animate={{ height: isListening ? height : 4 }}
          transition={{ 
            type: "spring", 
            stiffness: isListening ? 300 : 150, 
            damping: isListening ? 20 : 15 
          }}
          className="w-1.5 bg-[var(--brand-primary)] rounded-full"
        />
      ))}
    </div>
  );
}

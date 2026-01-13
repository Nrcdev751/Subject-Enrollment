import React, { useState, useRef, useEffect } from 'react';
import { RefreshCcw, AlertTriangle, CloudLightning } from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { captureOriginal } from '../services/imageUtils';

interface Props {
  user: UserProfile | null;
  onBack: () => void;
}

export const GuessScreen: React.FC<Props> = ({ user, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [matchPercent, setMatchPercent] = useState(0);
  const [detectedName, setDetectedName] = useState('SEARCHING...');
  const [statusMessage, setStatusMessage] = useState('CONNECTING TO CORE...');
  const [isMatch, setIsMatch] = useState(false);
  const [isModelReady, setIsModelReady] = useState(true);

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream;

    const startCamera = async () => {
      try {
        if (stream) stream.getTracks().forEach(t => t.stop());
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatusMessage("VIDEO FEED ACTIVE");
      } catch (e) {
        console.error("Camera fail", e);
        setStatusMessage("CAMERA ERROR");
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  // Real-time Recognition Logic via API
  useEffect(() => {
    let active = true;
    
    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && active) {
          // Capture frame - low res is fine for inference
          const frame = captureOriginal(videoRef.current, 320, 240); 
          
          try {
              const result = await api.recognize(frame);
              
              if (result.name === "MODEL NOT READY") {
                  setDetectedName("WAITING FOR TRAIN");
                  setMatchPercent(0);
                  setIsMatch(false);
                  setIsModelReady(false);
                  setStatusMessage("AWAITING GLOBAL TRAIN");
              } else {
                  setIsModelReady(true);
                  setMatchPercent(result.confidence);
                  setDetectedName(result.match ? result.name : "SEARCHING...");
                  setIsMatch(result.match);
                  setStatusMessage(result.match ? "IDENTITY CONFIRMED" : "SCANNING FACES...");
              }
          } catch (e) {
              setStatusMessage("CONNECTION LOST");
          }
      }
    }, 500); // 500ms polling for snappier feel

    return () => {
        active = false;
        clearInterval(interval);
    };
  }, []);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Full Screen Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover opacity-60 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />

      {/* Sci-Fi Overlay Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      {/* Scanning Frame */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-colors duration-300 ${isMatch ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'border-sci-neon/50'}`}>
        
        {/* Moving Scan Line */}
        <div className={`absolute w-full h-2 bg-sci-neon/50 shadow-[0_0_15px_#22d3ee] animate-scan blur-[2px] ${!isModelReady ? 'hidden' : ''}`}></div>
        
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${isMatch ? 'border-emerald-500' : 'border-sci-neon'}`}></div>
        <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${isMatch ? 'border-emerald-500' : 'border-sci-neon'}`}></div>
        <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${isMatch ? 'border-emerald-500' : 'border-sci-neon'}`}></div>
        <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${isMatch ? 'border-emerald-500' : 'border-sci-neon'}`}></div>

        {/* Center Target */}
        {!isMatch && isModelReady && (
             <div className="absolute top-1/2 left-1/2 w-4 h-4 border border-sci-neon/30 -translate-x-1/2 -translate-y-1/2"></div>
        )}
      </div>

      {/* Top HUD */}
      <div className="absolute top-6 left-0 w-full flex flex-col items-center gap-2 z-20 pointer-events-none">
        <div className={`backdrop-blur-md border px-6 py-3 rounded-full flex items-center gap-4 shadow-lg transition-colors duration-300 ${isMatch ? 'bg-emerald-950/80 border-emerald-500/50' : 'bg-black/70 border-sci-panel'}`}>
           <div className={`w-3 h-3 rounded-full ${isMatch ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
           <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 font-mono tracking-widest">CONFIDENCE</span>
             <span className={`text-xl font-bold font-mono ${isMatch ? 'text-emerald-400' : 'text-gray-500'}`}>
                {matchPercent}%
             </span>
           </div>
        </div>
        
        {/* Warning if model not trained */}
        {!isModelReady && (
            <div className="mt-4 bg-yellow-900/80 text-yellow-500 px-4 py-2 rounded border border-yellow-600 flex items-center gap-2 font-mono text-xs backdrop-blur">
                <AlertTriangle size={14} />
                NEURAL CORE UNTRAINED
            </div>
        )}

        {isMatch && (
            <div className="mt-2 animate-bounce">
                <span className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-6 py-2 rounded text-lg font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.5)] backdrop-blur-md">
                    {detectedName}
                </span>
            </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 w-full flex justify-between items-end px-8 z-20">
         <div className="font-mono text-[10px] text-sci-neon/70 bg-black/40 p-2 rounded backdrop-blur border border-white/5">
            <div className="flex items-center gap-2">
                <CloudLightning size={10} />
                <span>STATUS: {statusMessage}</span>
            </div>
            <div>MODE: SYNC_INFERENCE</div>
         </div>

         <button 
           onClick={toggleCamera}
           className="bg-black/50 border border-sci-neon text-sci-neon p-4 rounded-full backdrop-blur hover:bg-sci-neon hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
         >
           <RefreshCcw size={24} />
         </button>

         <button 
            onClick={onBack}
            className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-2 rounded hover:bg-red-900/50 transition-colors backdrop-blur font-mono text-xs"
         >
            ABORT
         </button>
      </div>
    </div>
  );
};

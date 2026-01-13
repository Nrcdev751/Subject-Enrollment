import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CheckCircle, Trash2, UploadCloud } from 'lucide-react';
import { SciButton, SciInput, SciCard } from '../components/SciFiUI';
import { applyLBPVisualFilter, captureOriginal } from '../services/imageUtils';
import { CapturedImage } from '../types';
import { api } from '../services/api';

interface Props {
  onComplete: (name: string, images: CapturedImage[]) => void;
}

export const EnrollmentScreen: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [captures, setCaptures] = useState<CapturedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const MAX_CAPTURES = 5;

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera permission denied or not available.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (!videoRef.current || captures.length >= MAX_CAPTURES) return;

    // Capture in Portrait Mode (3:4 aspect ratio)
    const original = captureOriginal(videoRef.current, 240, 320);
    const lbp = applyLBPVisualFilter(videoRef.current, 240, 320);

    const newCapture: CapturedImage = {
      id: Date.now().toString(),
      original,
      lbpProcessed: lbp
    };

    setCaptures([...captures, newCapture]);
  };

  const handleSubmit = async () => {
      setIsUploading(true);
      try {
          await api.enrollUser(name, captures);
          onComplete(name, captures);
      } catch (e) {
          console.error(e);
          alert("Failed to upload to Neural Core");
      } finally {
          setIsUploading(false);
      }
  };

  const handleReset = () => {
    setCaptures([]);
    setName('');
  };

  return (
    <div className="flex flex-col h-full bg-sci-base overflow-hidden">
      {/* FIXED TOP SECTION: Header, Camera, Controls */}
      <div className="flex-none p-4 pb-2 z-10 bg-sci-base border-b border-sci-panel shadow-[0_4px_20px_-10px_rgba(34,211,238,0.1)]">
        <header className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none">
              SUBJECT <span className="text-sci-neon">ENROLLMENT</span>
            </h2>
            <p className="text-gray-500 text-[10px] font-mono mt-1">LBPH PROTOCOL: INIT PHASE 1</p>
          </div>
          <div className="font-mono text-xs text-sci-neon border border-sci-neon/30 px-2 py-1 rounded bg-sci-neon/5">
            SAMPLES: {captures.length}/{MAX_CAPTURES}
          </div>
        </header>

        <div className="space-y-3">
            <SciInput 
              placeholder="ENTER SUBJECT ID" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Camera View - Narrower Portrait Mode */}
            <div className="relative w-[70%] mx-auto aspect-[3/4] max-h-[40vh] bg-black border border-gray-800 rounded-lg overflow-hidden shadow-inner ring-1 ring-sci-neon/20">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay Grid */}
                <div className="absolute inset-0 border border-sci-neon/20 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-sci-neon/50 rounded-lg"></div>
                  <div className="absolute top-0 left-1/2 w-px h-full bg-sci-neon/10"></div>
                  <div className="absolute top-1/2 left-0 w-full h-px bg-sci-neon/10"></div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
                {captures.length < MAX_CAPTURES ? (
                  <SciButton onClick={handleCapture} disabled={!name} className="w-full justify-center">
                    <div className="flex items-center gap-2">
                      <Camera size={16} />
                      CAPTURE
                    </div>
                  </SciButton>
                ) : (
                  <SciButton onClick={handleSubmit} disabled={isUploading} className="w-full justify-center !border-emerald-500 !text-emerald-400 !bg-emerald-950/30">
                    <div className="flex items-center gap-2">
                      {isUploading ? <UploadCloud className="animate-bounce" size={16} /> : <CheckCircle size={16} />}
                      {isUploading ? "UPLOADING..." : "FINISH"}
                    </div>
                  </SciButton>
                )}
                
                {captures.length > 0 && (
                  <SciButton variant="danger" onClick={handleReset} className="px-3" disabled={isUploading}>
                    <Trash2 size={16} />
                  </SciButton>
                )}
            </div>
        </div>
      </div>

      {/* SCROLLABLE BOTTOM SECTION: Gallery */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {captures.length === 0 && (
            <div className="h-20 flex items-center justify-center text-gray-700 font-mono text-xs border border-dashed border-gray-800 rounded opacity-50">
                [ NO DATA ACQUIRED ]
            </div>
        )}
        <div className="grid grid-cols-1 gap-3 pb-4">
            {captures.map((cap, idx) => (
            <SciCard key={cap.id} title={`SAMPLE_0${idx + 1} :: PROCESSED`}>
                <div className="flex gap-2 h-16">
                    <div className="w-12 relative bg-gray-900 border border-gray-700 shrink-0 aspect-[3/4]">
                        <img src={cap.original} alt="Orig" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-center text-gray-300">RGB</div>
                    </div>
                    <div className="flex items-center justify-center text-sci-neon px-1">
                        <span className="font-mono text-[10px]">➜</span>
                    </div>
                    <div className="w-12 relative bg-gray-900 border border-sci-neon/30 shrink-0 aspect-[3/4]">
                        <img src={cap.lbpProcessed} alt="LBP" className="w-full h-full object-cover filter contrast-125" />
                        <div className="absolute bottom-0 inset-x-0 bg-sci-neon/20 text-[8px] text-center text-sci-neon">LBP</div>
                    </div>
                    <div className="flex-1 ml-2 flex flex-col justify-center text-[10px] text-gray-500 font-mono border-l border-gray-800 pl-3">
                         <div>ID: <span className="text-gray-300">{cap.id.slice(-6)}</span></div>
                         <div>STATUS: <span className="text-emerald-500">VECTORIZED</span></div>
                    </div>
                </div>
            </SciCard>
            ))}
        </div>
      </div>
    </div>
  );
};

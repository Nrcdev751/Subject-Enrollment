import React, { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { BrainCircuit, Check, Database } from 'lucide-react';
import { SciButton, SciCard } from '../components/SciFiUI';
import { HistogramData } from '../types';
import { api } from '../services/api';

interface Props {
  onComplete: () => void;
}

export const TrainingScreen: React.FC<Props> = ({ onComplete }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chartData, setChartData] = useState<HistogramData[]>([]);
  const [statusText, setStatusText] = useState("SYSTEM READY");

  // Generate random histogram data
  const generateRandomData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      bin: i * 12,
      value: Math.floor(Math.random() * 255)
    }));
  };

  useEffect(() => {
    setChartData(generateRandomData());
  }, []);

  const startTraining = async () => {
      setIsTraining(true);
      
      // Start visual simulation
      let p = 0;
      const interval = setInterval(() => {
          p += 2;
          if (p <= 90) setProgress(p);
          if (Math.random() > 0.5) setChartData(generateRandomData());
          
          if (p < 30) setStatusText("SYNCING DATABASE...");
          else if (p < 60) setStatusText("AGGREGATING GLOBAL VECTORS...");
          else if (p < 90) setStatusText("REBUILDING TRAINER.YML...");
      }, 100);

      try {
          // Trigger actual backend training
          await api.trainModel();
          
          // Complete the bar
          clearInterval(interval);
          setProgress(100);
          setStatusText("GLOBAL MODEL UPDATED");
      } catch (e) {
          console.error("Training failed", e);
          setStatusText("TRAINING ERROR - CHECK CONSOLE");
          clearInterval(interval);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-8">
      
      {/* Central Visual */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Circular Progress Background */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r="120" stroke="#1f2937" strokeWidth="4" fill="transparent" />
          <circle 
            cx="128" cy="128" r="120" 
            stroke="#22d3ee" strokeWidth="4" 
            fill="transparent" 
            strokeDasharray={753}
            strokeDashoffset={753 - (753 * progress) / 100}
            className={`transition-all duration-200 ${isTraining ? 'opacity-100' : 'opacity-30'}`}
          />
        </svg>

        {/* Inner Content */}
        <div className="flex flex-col items-center z-10 p-4 text-center">
            {progress >= 100 ? (
                <Check className="text-emerald-400 w-16 h-16 animate-bounce" />
            ) : (
                <BrainCircuit className={`text-sci-neon w-16 h-16 ${isTraining ? 'animate-pulse' : ''}`} />
            )}
            <div className="text-3xl font-mono font-bold mt-2 text-white">{Math.floor(progress)}%</div>
            <div className="text-xs text-sci-neon font-mono mt-1">{statusText}</div>
        </div>

        {/* Orbiting Nodes Animation (Simulated via CSS) */}
        {isTraining && progress < 100 && (
            <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#fff]"></div>
                <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-sci-cyan rounded-full"></div>
                <div className="absolute bottom-1/4 right-0 w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
        )}
      </div>

      {/* Histogram Visualization */}
      <div className="w-full max-w-md h-40 bg-black/50 border border-gray-800 p-2 rounded relative">
        <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono">
            LIVE HISTOGRAM FEED
        </div>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <Bar dataKey="value" fill="#22d3ee" isAnimationActive={false} />
                <XAxis dataKey="bin" tick={{fill: '#666', fontSize: 10}} interval={2} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000', borderColor: '#333'}} />
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div className="w-full max-w-xs">
        {!isTraining && progress === 0 && (
            <SciButton onClick={startTraining} className="w-full text-center flex justify-center py-4">
                <span className="flex items-center gap-2 text-lg">
                    <Database size={20} />
                    START GLOBAL TRAINING
                </span>
            </SciButton>
        )}

        {progress >= 100 && (
            <SciButton onClick={onComplete} variant="primary" className="w-full flex justify-center !border-emerald-500 !text-emerald-400">
                PROCEED TO TEST LAB
            </SciButton>
        )}
      </div>
    </div>
  );
};

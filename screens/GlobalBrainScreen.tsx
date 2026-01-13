import React, { useState, useEffect } from 'react';
import { Network, Activity, Cpu } from 'lucide-react';
import { UserSummary, HistogramData } from '../types';
import { api } from '../services/api';
import { SciCard } from '../components/SciFiUI';
import { applyLBPVisualFilter, calculateHistogramData } from '../services/imageUtils';
import { BarChart, Bar, ResponsiveContainer, YAxis } from 'recharts';

export const GlobalBrainScreen: React.FC = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [processedData, setProcessedData] = useState<Record<number, { lbp: string, hist: HistogramData[] }>>({});
  const [loading, setLoading] = useState(true);
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
      
      // Process visualizations for each user (LBP & Histogram)
      const visualData: Record<number, { lbp: string, hist: HistogramData[] }> = {};
      
      for (const user of data) {
         if (user.thumbnail) {
             // Create an image element to process
             const img = new Image();
             img.src = user.thumbnail;
             await new Promise((resolve) => { img.onload = resolve; });
             
             // 1. Generate LBP Visual
             const lbpUrl = applyLBPVisualFilter(img, 100, 133); // Small portrait size
             
             // 2. Calculate Histogram
             const histData = await calculateHistogramData(user.thumbnail);
             
             visualData[user.id] = { lbp: lbpUrl, hist: histData };
         }
      }
      setProcessedData(visualData);
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch global users", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // WebSocket for Real-time Updates
    const ws = api.connectWebSocket((msg) => {
        if (msg.type === 'NEW_ENROLLMENT' || msg.type === 'TRAINING_COMPLETE') {
            // Trigger animation if specific user mentioned
            if (msg.user_name) {
                setHighlightedUser(msg.user_name);
                setTimeout(() => setHighlightedUser(null), 3000);
            }
            fetchUsers();
        }
    });

    return () => {
        ws.close();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-sci-base overflow-hidden">
        {/* Header */}
        <div className="flex-none p-4 pb-2 z-10 bg-sci-base border-b border-sci-panel shadow-md">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Network className="text-sci-neon" size={24} />
                        GLOBAL <span className="text-sci-neon">BRAIN</span>
                    </h2>
                    <p className="text-gray-500 text-[10px] font-mono mt-1">
                        CONNECTED NODES: {users.length} | LIVE LINK: ACTIVE
                    </p>
                </div>
                <div className="animate-pulse">
                    <Activity className="text-emerald-500" size={20} />
                </div>
            </header>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
                <div className="flex items-center justify-center h-full text-sci-neon font-mono animate-pulse">
                    DOWNLOADING NEURAL MAP...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {users.map((user) => {
                        const isHighlighted = highlightedUser === user.name;
                        const data = processedData[user.id];

                        return (
                            <div 
                                key={user.id} 
                                className={`transition-all duration-500 transform ${isHighlighted ? 'scale-105 ring-2 ring-sci-neon shadow-[0_0_20px_rgba(34,211,238,0.5)] z-10' : 'scale-100'}`}
                            >
                                <SciCard title={`NODE: ${user.name.toUpperCase()}`}>
                                    <div className="flex gap-2 h-24">
                                        {/* 1. Original Face */}
                                        <div className="w-16 relative bg-gray-900 border border-gray-700 shrink-0 aspect-[3/4] overflow-hidden rounded-sm">
                                            {user.thumbnail ? (
                                                <img src={user.thumbnail} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-700"><Cpu size={16}/></div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-center text-gray-300">INPUT</div>
                                        </div>

                                        {/* 2. LBP Texture */}
                                        <div className="w-16 relative bg-gray-900 border border-sci-neon/30 shrink-0 aspect-[3/4] overflow-hidden rounded-sm">
                                            {data?.lbp && (
                                                <img src={data.lbp} alt="LBP" className="w-full h-full object-cover filter contrast-125 opacity-80" />
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 bg-sci-neon/20 text-[7px] text-center text-sci-neon">TEXTURE</div>
                                        </div>

                                        {/* 3. Histogram */}
                                        <div className="flex-1 flex flex-col justify-end bg-black/40 border border-gray-800 p-1 relative">
                                             <div className="absolute top-1 right-1 text-[7px] text-gray-500 font-mono">FEAT. VECTOR</div>
                                             <div className="h-full w-full pt-3">
                                                {data?.hist && (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={data.hist}>
                                                            <Bar dataKey="value" fill="#22d3ee" isAnimationActive={false} />
                                                            <YAxis hide domain={[0, 100]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                )}
                                             </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 flex justify-between items-center border-t border-gray-800 pt-1">
                                        <span className="text-[9px] font-mono text-gray-500">SAMPLES: {user.sample_count}</span>
                                        <span className="text-[9px] font-mono text-emerald-500">
                                            {isHighlighted ? '<< UPDATING >>' : 'SYNCED'}
                                        </span>
                                    </div>
                                </SciCard>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

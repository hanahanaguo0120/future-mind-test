
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppStatus } from '../types';
import { addCounselingLog } from '../services/firebase';
import { GlassCard, HudInput, NeonButton } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';

export const CounselingTerminalView: React.FC = () => {
  const { 
    currentStudent, 
    currentUser, 
    currentSession, 
    updateSession, 
    lockSystem, 
    setStatus 
  } = useAppStore();
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!currentStudent || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession.content.trim()) return;

    setIsUploading(true);

    const logData = {
      studentId: currentStudent.studentId,
      teacherId: currentUser.id,
      moodScore: currentSession.moodScore,
      content: currentSession.content,
    };

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) { p = 100; clearInterval(interval); }
      setProgress(Math.floor(p));
    }, 150);

    try {
      await addCounselingLog(logData);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => lockSystem(), 600);
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      alert(err.message || '傳輸錯誤。');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10 px-4">
      <AnimatePresence>
        {isUploading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/95 backdrop-blur-2xl px-6">
            <div className="text-center w-full max-w-sm">
              <div className="mb-6 h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-fcs-cyan shadow-[0_0_20px_#00f0ff]" />
              </div>
              <p className="text-xs font-mono text-fcs-cyan animate-pulse uppercase tracking-widest">Secure Uploading {progress}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 border-l-4 border-fcs-cyan pl-4 gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-black neon-cyan uppercase leading-none">輔導終端機</h2>
          <p className="text-[9px] font-mono text-slate-500 mt-2 uppercase">Subject: {currentStudent.studentId} // Recording</p>
        </div>
        <div className="text-right w-full sm:w-auto">
          <p className="text-lg md:text-xl font-bold text-fcs-cyan">{currentStudent.name}</p>
        </div>
      </div>

      <GlassCard className="!bg-slate-900/40 border-fcs-cyan/20 !p-5 md:!p-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-8 md:mb-10">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">心理評估 (1 - 10)</label>
              <div className="text-xl md:text-2xl font-black neon-magenta mono">{currentSession.moodScore.toString().padStart(2, '0')}</div>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={currentSession.moodScore} 
              onChange={(e) => updateSession({ moodScore: parseInt(e.target.value) })}
              className="w-full neon-slider cursor-pointer h-8" 
            />
            
            <div className="flex justify-between mt-2 text-[8px] md:text-[9px] text-slate-600 font-mono uppercase">
              <span>Severe</span>
              <span>Neutral</span>
              <span>Optimal</span>
            </div>
          </div>

          <HudInput 
            label="諮商紀錄 (端對端加密)" 
            textarea 
            value={currentSession.content} 
            onChange={(e) => updateSession({ content: e.target.value })} 
            placeholder="請輸入晤談內容..."
          />

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <NeonButton type="submit" className="w-full sm:flex-[3] py-4">提交並銷毀資料</NeonButton>
            <button 
              type="button" 
              onClick={() => { if (confirm('捨棄紀錄？')) setStatus(AppStatus.STUDENT_SELECT); }} 
              className="w-full sm:flex-[1] py-3 border border-slate-700 text-slate-500 text-[10px] uppercase"
            >
              Cancel
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

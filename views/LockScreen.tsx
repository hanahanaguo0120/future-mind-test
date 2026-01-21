
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { motion } from 'framer-motion';
import { HudInput, NeonButton } from '../components/UI';
import { getSystemConfig } from '../services/firebase';

export const LockScreenView: React.FC = () => {
  const { unlockSystem } = useAppStore();
  const [unlockKey, setUnlockKey] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      const config = await getSystemConfig();
      
      // 回退機制：雲端未配置
      if (!config) {
        if (unlockKey === 'unlock') {
          unlockSystem();
          return;
        }
      } else {
        // 正常模式：比對雲端密鑰
        if (unlockKey === config.unlock_password) {
          unlockSystem();
          return;
        }
      }
      
      // 驗證失敗
      setError(true);
      setTimeout(() => setError(false), 2000);
      setUnlockKey('');
    } catch (err) {
      alert('無法連接雲端進行解鎖。');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f172a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-12">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-2 border-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-black tracking-tighter text-red-500 mb-2 font-mono">STATE: LOCKED</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mono">資料傳輸成功 • 雲端密鑰保護中</p>
        </div>

        <div className="glass p-8 rounded-xl border-red-500/20">
          <p className="text-xs text-slate-400 mb-6 text-center leading-relaxed font-sans">
            系統進入安全保護模式。本次會話的所有暫存資料已從全域狀態中徹底刪除。請輸入雲端解鎖密鑰以返回選擇界面。
          </p>
          
          <form onSubmit={handleUnlock}>
            <HudInput 
              label="REMOTE_UNLOCK_KEY" 
              type="password" 
              value={unlockKey} 
              onChange={(e) => setUnlockKey(e.target.value)}
              placeholder="••••••••"
            />
            {error && <p className="text-red-500 text-[10px] uppercase font-mono mb-4 text-center animate-shake">Access Denied</p>}
            
            <NeonButton variant="magenta" type="submit" className="w-full mt-2 !border-red-600 !text-red-500" disabled={isVerifying}>
              {isVerifying ? "雲端解碼中..." : "執行系統解鎖"}
            </NeonButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
};


import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AppStatus } from '../types';
import { GlassCard, HudInput, NeonButton } from '../components/UI';
import { getSystemConfig } from '../services/firebase';
import { motion } from 'framer-motion';

export const LoginView: React.FC = () => {
  const { setUser, setStatus } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    try {
      // 1. 嘗試從 Firebase 獲取密鑰
      const config = await getSystemConfig();
      
      // 2. 如果資料庫尚未初始化 (config 為空)
      if (!config) {
        console.warn("FCS [SYSTEM]: 偵測到雲端配置缺失，進入緊急初始化模式。");
        // 緊急模式下允許使用預設密碼 'admin'
        if (password === 'admin') {
          setUser({ id: "SYS-ADMIN", name: username || '系統管理員', role: 'admin' });
          setStatus(AppStatus.STUDENT_SELECT);
          return;
        } else {
          alert('系統尚未初始化。請使用預設管理密碼 (admin) 登入以執行初始化程序。');
          setIsAuthenticating(false);
          return;
        }
      }

      // 3. 正常模式：比對雲端密鑰
      if (password === config.admin_password) {
        setUser({ id: `T-${Math.floor(Math.random() * 999)}`, name: username || '導師 01', role: 'teacher' });
        setStatus(AppStatus.STUDENT_SELECT);
      } else {
        setIsAuthenticating(false);
        alert('授權失敗：存取密鑰錯誤。');
      }
    } catch (err) {
      console.error("FCS [AUTH_ERROR]:", err);
      setIsAuthenticating(false);
      alert('連線失敗，請檢查網路狀態或 Firebase 設定。');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-fcs-cyan/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-fcs-magenta/5 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="mb-8 text-center">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block px-3 py-1 border border-fcs-cyan/30 text-[9px] font-mono text-fcs-cyan uppercase tracking-[0.3em] mb-4"
          >
            System Auth Terminal
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 neon-cyan uppercase italic">Future Mind</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">輔導紀錄矩陣系統 // V4.5.1</p>
        </div>
        
        <GlassCard className="!bg-slate-900/60 border-slate-800 backdrop-blur-3xl">
          <form onSubmit={handleLogin}>
            <HudInput 
              label="Personnel_ID" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="人員編號 / 名稱"
            />
            <HudInput 
              label="Access_Cypher" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
            
            <NeonButton 
              type="submit" 
              disabled={isAuthenticating}
              className="w-full mt-6 py-4 relative overflow-hidden"
            >
              {isAuthenticating ? "校驗雲端權限中..." : "啟動系統授權"}
            </NeonButton>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[9px] uppercase text-slate-600 font-mono tracking-tighter">
            <span>Server: ASIA-NE-1</span>
            <span>Auth: Firebase_Cloud</span>
          </div>
        </GlassCard>

        <p className="mt-6 text-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">
          首次使用請輸入預設密碼 <span className="text-slate-400">admin</span> 進入後台初始化
        </p>
      </motion.div>
    </div>
  );
};

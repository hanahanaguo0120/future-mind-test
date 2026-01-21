
import React from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useLocation 
} from 'react-router-dom';
import { useAppStore } from './store';
import { AppStatus } from './types';
import { LoginView } from './views/Login';
import { SessionView } from './views/SessionView';
import { DashboardView } from './views/Dashboard';
import { LockScreenView } from './views/LockScreen';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 導航組件：針對 RWD 優化
 */
const Navbar = () => {
  const location = useLocation();
  const logout = useAppStore((state) => state.logout);
  const setStatus = useAppStore((state) => state.setStatus);
  const currentUser = useAppStore((state) => state.currentUser);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // 直接執行登出，避免 confirm 被瀏覽器攔截
  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-fcs-cyan shadow-[0_0_8px_#00f0ff] rotate-45 shrink-0" />
        <Link to="/session" className="font-black text-lg md:text-xl tracking-tighter neon-cyan whitespace-nowrap">
          FM <span className="hidden sm:inline">FUTURE MIND</span>
        </Link>
      </div>
      
      <div className="flex gap-4 md:gap-8 text-[10px] md:text-[11px] uppercase font-bold font-mono tracking-widest items-center">
        <Link 
          to="/session" 
          onClick={() => setStatus(AppStatus.STUDENT_SELECT)}
          className={`transition-all hover:text-fcs-cyan ${isActive('/session') ? 'text-fcs-cyan' : 'text-slate-500'}`}
        >
          Session<span className="hidden sm:inline">_Vault</span>
        </Link>
        <Link 
          to="/admin" 
          onClick={() => setStatus(AppStatus.DASHBOARD)}
          className={`transition-all hover:text-fcs-cyan ${isActive('/admin') ? 'text-fcs-cyan' : 'text-slate-500'}`}
        >
          Admin<span className="hidden sm:inline">_HUD</span>
        </Link>
        <div className="border-l border-white/10 pl-4 md:pl-8 flex items-center gap-2 md:gap-4">
          <span className="hidden md:inline text-[9px] text-slate-600">ID: {currentUser?.id}</span>
          <button 
            type="button"
            onClick={handleExit} 
            className="text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all text-[9px] font-black tracking-widest border border-red-500/30 px-3 py-1.5 rounded uppercase active:scale-90"
          >
            EXIT
          </button>
        </div>
      </div>
    </nav>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a]">
      {/* 全域賽博裝飾 */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fcs-cyan to-transparent animate-pulse" />
        <div className="hidden md:block absolute top-[10%] right-[5%] w-96 h-96 border-2 border-fcs-cyan rounded-full opacity-5 animate-spin-slow" />
        <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 font-mono text-[7px] md:text-[8px] text-slate-600 uppercase flex flex-col gap-1 tracking-widest">
          <span>LATENCY: 0.004ms</span>
          <span>NET: SECURE_UPLINK</span>
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 md:pt-24 pb-8 md:pb-12">
        {children}
      </main>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 60s linear infinite; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const currentUser = useAppStore((state) => state.currentUser);
  const isLocked = useAppStore((state) => state.isLocked);

  // 若沒有使用者，顯示登入頁面
  if (!currentUser) return <LoginView />;
  
  // 若系統鎖定中，顯示鎖定畫面
  if (isLocked) return <LockScreenView />;

  return (
    <Router>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/session/*" element={<SessionView />} />
            <Route path="/admin" element={<DashboardView />} />
            <Route path="*" element={<Navigate to="/session" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Router>
  );
};

export default App;

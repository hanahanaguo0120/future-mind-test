
import { create } from 'zustand';
import { User, Student, AppStatus } from './types';

interface SessionData {
  moodScore: number;
  content: string;
}

const INITIAL_SESSION: SessionData = {
  moodScore: 5,
  content: '',
};

interface AppState {
  isLocked: boolean;
  isAdminAuthenticated: boolean; 
  currentUser: User | null;
  currentStudent: Student | null;
  currentSession: SessionData;
  status: AppStatus;
  
  setUser: (user: User | null) => void;
  setStudent: (student: Student | null) => void;
  setStatus: (status: AppStatus) => void;
  setAdminAuth: (isAuth: boolean) => void;
  
  updateSession: (data: Partial<SessionData>) => void;
  lockSystem: () => void;
  unlockSystem: () => void;
  resetSession: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLocked: false,
  isAdminAuthenticated: false,
  currentUser: null,
  currentStudent: null,
  currentSession: { ...INITIAL_SESSION },
  status: AppStatus.LOGIN,

  setUser: (currentUser) => set({ currentUser }),
  setStudent: (currentStudent) => set({ currentStudent }),
  setStatus: (status) => set({ status }),
  setAdminAuth: (isAdminAuthenticated) => set({ isAdminAuthenticated }),

  updateSession: (data) => set((state) => ({
    currentSession: { ...state.currentSession, ...data }
  })),

  lockSystem: () => {
    set({
      isLocked: true,
      isAdminAuthenticated: false,
      status: AppStatus.LOCKED,
      currentStudent: null,
      currentSession: { ...INITIAL_SESSION }
    });
    window.history.pushState(null, '', window.location.href);
  },

  unlockSystem: () => set({
    isLocked: false,
    isAdminAuthenticated: false,
    status: AppStatus.STUDENT_SELECT,
    currentSession: { ...INITIAL_SESSION }
  }),

  resetSession: () => set({ 
    currentStudent: null, 
    currentSession: { ...INITIAL_SESSION },
    status: AppStatus.STUDENT_SELECT 
  }),

  logout: () => {
    // 徹底清除狀態
    set({
      currentUser: null,
      currentStudent: null,
      currentSession: { ...INITIAL_SESSION },
      isLocked: false,
      isAdminAuthenticated: false,
      status: AppStatus.LOGIN
    });
    // 強制重置網址雜湊，避免留在無權限頁面
    window.location.hash = '#/';
  }
}));

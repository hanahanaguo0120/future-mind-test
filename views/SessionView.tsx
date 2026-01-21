
import React from 'react';
import { useAppStore } from '../store';
import { AppStatus } from '../types';
import { StudentSelectView } from './StudentSelect';
import { CounselingTerminalView } from './CounselingTerminal';
import { LockScreenView } from './LockScreen';
import { motion, AnimatePresence } from 'framer-motion';

export const SessionView: React.FC = () => {
  const { status, isLocked } = useAppStore();

  // 如果系統已鎖定，優先呈現鎖定畫面
  if (isLocked) {
    return <LockScreenView />;
  }

  // 渲染邏輯優化
  const renderContent = () => {
    switch (status) {
      case AppStatus.TERMINAL:
        return (
          <motion.div
            key="step-terminal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            <CounselingTerminalView />
          </motion.div>
        );
      case AppStatus.STUDENT_SELECT:
      case AppStatus.LOGIN:
      case AppStatus.DASHBOARD: // 防止誤觸導航後中間空白
      default:
        return (
          <motion.div
            key="step-select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <StudentSelectView />
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)]">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};

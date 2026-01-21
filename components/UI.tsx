
import React from 'react';
import { motion } from 'framer-motion';

export const NeonButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'cyan' | 'magenta';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}> = ({ onClick, children, variant = 'cyan', className = '', type = 'button', disabled }) => {
  const colors = variant === 'cyan' 
    ? 'border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 glow-button-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
    : 'border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/10 shadow-[0_0_10px_rgba(255,0,255,0.2)]';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-6 py-2 border uppercase tracking-wider font-bold text-sm rounded transition-all active:scale-95 disabled:opacity-50 ${colors} ${className}`}
    >
      {children}
    </button>
  );
};

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass p-8 rounded-xl glow-border-cyan ${className}`}
  >
    {children}
  </motion.div>
);

export const HudInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
  max?: number;
  min?: number;
}> = ({ label, value, onChange, type = 'text', textarea, placeholder, max, min }) => (
  <div className="mb-6">
    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2 font-mono">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-900/50 border-b-2 border-slate-700 focus:border-[#00f0ff] outline-none py-3 px-1 transition-colors text-slate-100 resize-none h-32"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        max={max}
        min={min}
        placeholder={placeholder}
        className="w-full bg-slate-900/50 border-b-2 border-slate-700 focus:border-[#00f0ff] outline-none py-3 px-1 transition-colors text-slate-100"
      />
    )}
  </div>
);

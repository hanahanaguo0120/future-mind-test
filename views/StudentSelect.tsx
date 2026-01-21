
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppStatus, Student } from '../types';
import { subscribeToStudents } from '../services/firebase';
import { GlassCard, NeonButton } from '../components/UI';
import { motion } from 'framer-motion';

export const StudentSelectView: React.FC = () => {
  const { setStudent, setStatus, currentUser } = useAppStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 使用實時監聽，確保名單永遠是最新的
    const unsubscribe = subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const selectStudent = (student: Student) => {
    setStudent(student);
    setStatus(AppStatus.TERMINAL);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold neon-cyan uppercase mb-1 italic tracking-tighter">對象矩陣選擇</h2>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Select Subject For Session // Vault_Access</p>
        </div>
        <div className="text-right font-mono text-[10px]">
          <p className="text-slate-600 uppercase">Operator: {currentUser?.name}</p>
          <p className="text-fcs-cyan animate-pulse">UPLINK_ESTABLISHED</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-fcs-cyan animate-pulse font-mono text-sm tracking-[0.5em]">SCANNING_CLOUD_RECORDS...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.length === 0 ? (
            <div className="col-span-2 text-center py-16 border border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-600 font-mono text-xs uppercase italic">No_Subjects_Found_In_Matrix</p>
              <p className="text-[10px] text-slate-700 mt-2">請聯繫管理員建立對象資料</p>
            </div>
          ) : (
            students.map((student, idx) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => selectStudent(student)}
                className="group cursor-pointer bg-slate-900/40 border border-slate-800 p-6 rounded-lg hover:border-fcs-cyan hover:bg-fcs-cyan/5 transition-all flex justify-between items-center shadow-lg"
              >
                <div>
                  <span className="block text-[9px] font-mono text-slate-600 mb-1 uppercase tracking-tighter">Identity_Code: {student.studentId}</span>
                  <span className="text-xl font-bold group-hover:text-fcs-cyan transition-colors">{student.name}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-slate-600 font-mono uppercase">Sector</span>
                  <span className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{student.class}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <div className="mt-16 text-center">
        <button 
          onClick={() => window.location.reload()} 
          className="text-[10px] uppercase tracking-[0.3em] text-slate-600 hover:text-fcs-magenta transition-colors font-mono"
        >
          [ Terminate_Secure_Link ]
        </button>
      </div>
    </div>
  );
};

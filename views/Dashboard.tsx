
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { AppStatus, Student, CounselingLog } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { GlassCard, NeonButton, HudInput } from '../components/UI';
import { getMoodTrends, subscribeToStudents, upsertStudent, deleteStudent, initializeDatabase, getSystemConfig } from '../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardView: React.FC = () => {
  const { isAdminAuthenticated, setAdminAuth } = useAppStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'management' | 'system'>('analytics');
  const [unlockKey, setUnlockKey] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<CounselingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [initStatus, setInitStatus] = useState<'idle' | 'running' | 'done'>('idle');

  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student>>({ studentId: '', name: '', class: '', active: true });
  const [purgeTarget, setPurgeTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated) return;
    setLoading(true);
    const unsubscribe = subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (selectedStudent && activeTab === 'analytics') {
      const fetchTrends = async () => {
        setFetchingLogs(true);
        try {
          const logs = await getMoodTrends(selectedStudent.studentId);
          setRawLogs([...logs].reverse()); 
          
          // 強化數據映射，確保每一筆資料都能被正確渲染
          const chartData = logs.map(log => {
            let dateStr = '...';
            if (log.timestamp) {
              const d = typeof log.timestamp.toDate === 'function' ? log.timestamp.toDate() : new Date();
              dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
            }
            return {
              date: dateStr,
              mood: Number(log.moodScore) || 0,
            };
          });
          
          setMoodData(chartData);
        } catch (err) {
          console.error("FCS_DASH_FETCH_ERR:", err);
        } finally {
          setFetchingLogs(false);
        }
      };
      fetchTrends();
    } else {
      setMoodData([]);
      setRawLogs([]);
    }
  }, [selectedStudent, activeTab]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const config = await getSystemConfig();
      if (!config || unlockKey === (config.admin_password || 'admin')) setAdminAuth(true);
      else alert('密鑰錯誤。');
    } catch (err) {
      alert('連線失敗。');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRunInit = async () => {
    setInitStatus('running');
    try {
      await initializeDatabase();
      setInitStatus('done');
      alert('初始化完成。');
    } catch (e) {
      setInitStatus('idle');
    }
  };

  const handleSaveStudent = async () => {
    if (!editingStudent.studentId?.trim()) return alert('ID 必填');
    setLoading(true);
    try {
      await upsertStudent(editingStudent as Student);
      setIsEditing(false);
    } catch (err) {
      alert('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  const executePurge = async () => {
    if (!purgeTarget) return;
    const id = purgeTarget;
    setPurgeTarget(null);
    setLoading(true);
    try {
      await deleteStudent(id);
      if (selectedStudent?.studentId === id) setSelectedStudent(null);
    } catch (err: any) {
      alert("抹除失敗：" + (err.message || "未知錯誤"));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <GlassCard className="max-w-md w-full !border-fcs-magenta">
          <h2 className="text-2xl font-black text-fcs-magenta italic uppercase text-center mb-6 tracking-tighter">Admin_HUD_Lock</h2>
          <form onSubmit={handleAdminAuth}>
            <HudInput label="Personnel_Access_Key" type="password" value={unlockKey} onChange={(e) => setUnlockKey(e.target.value)} />
            <NeonButton variant="magenta" type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? "校驗雲端密鑰中..." : "解鎖管理介面"}
            </NeonButton>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex border-b border-white/5 mb-8 gap-8 overflow-x-auto whitespace-nowrap custom-scrollbar">
        <button onClick={() => setActiveTab('analytics')} className={`pb-4 text-xs font-mono uppercase tracking-widest ${activeTab === 'analytics' ? 'text-fcs-cyan border-b-2 border-fcs-cyan' : 'text-slate-500'}`}>[ 數據分析 ]</button>
        <button onClick={() => setActiveTab('management')} className={`pb-4 text-xs font-mono uppercase tracking-widest ${activeTab === 'management' ? 'text-fcs-cyan border-b-2 border-fcs-cyan' : 'text-slate-500'}`}>[ 對象管理 ]</button>
        <button onClick={() => setActiveTab('system')} className={`pb-4 text-xs font-mono uppercase tracking-widest ${activeTab === 'system' ? 'text-fcs-magenta border-b-2 border-fcs-magenta' : 'text-slate-500'}`}>[ 系統初始化 ]</button>
      </div>

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 px-1">Subject_List</h4>
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 custom-scrollbar max-h-[600px]">
              {students.map((student) => (
                <button 
                  key={student.studentId} 
                  onClick={() => setSelectedStudent(student)} 
                  className={`flex-shrink-0 w-48 lg:w-full p-4 rounded border text-left transition-all ${selectedStudent?.studentId === student.studentId ? 'bg-fcs-cyan/10 border-fcs-cyan text-fcs-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{student.name}</span>
                    <span className="text-[10px] font-mono opacity-60">{student.class}</span>
                  </div>
                </button>
              ))}
              {students.length === 0 && <div className="text-[10px] text-slate-700 p-4 border border-dashed border-slate-800 rounded">NULL_RECORDS</div>}
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <GlassCard className="!p-8 flex flex-col min-h-[450px]">
              {!selectedStudent ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-700 space-y-4 py-20">
                  <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-mono text-xs uppercase tracking-[0.3em]">Select_Subject_To_Decrypt_Trends</span>
                </div>
              ) : fetchingLogs ? (
                <div className="flex-1 flex items-center justify-center text-fcs-cyan animate-pulse font-mono text-xs py-20">UPLINK_DECRYPTING...</div>
              ) : moodData.length > 0 ? (
                <>
                  <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-fcs-cyan font-bold italic uppercase tracking-tighter">Mood_Analysis_Protocol // {selectedStudent.name}</h3>
                    <div className="text-[10px] text-slate-500 font-mono">AVG: { (moodData.reduce((acc, curr) => acc + curr.mood, 0) / moodData.length).toFixed(1) }</div>
                  </div>
                  
                  {/* 強制圖表容器高度，確保 ResponsiveContainer 有基準點 */}
                  <div className="w-full h-[300px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        key={`chart-${selectedStudent.studentId}`}
                        data={moodData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={[1, 10]} 
                          ticks={[1, 3, 5, 7, 10]}
                        />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid #00f0ff', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                          itemStyle={{ color: '#00f0ff' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#00f0ff" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#00f0ff', strokeWidth: 0 }} 
                          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-700 py-20 font-mono text-xs">
                  <span className="tracking-[0.5em]">NO_DATA_LINK_FOUND</span>
                </div>
              )}
            </GlassCard>

            <AnimatePresence>
              {selectedStudent && !fetchingLogs && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-1">Raw_Log_Stream</h4>
                  {rawLogs.map((log, i) => (
                    <div key={i} className="bg-slate-900/40 border border-white/5 p-5 rounded-lg hover:border-fcs-cyan/30 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] text-fcs-cyan font-mono bg-fcs-cyan/5 px-2 py-1 rounded">SCORE: {log.moodScore}</div>
                        <div className="text-[9px] text-slate-600 font-mono uppercase">{log.timestamp?.toDate().toLocaleString()}</div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-100 transition-colors">{log.content}</p>
                    </div>
                  ))}
                  {rawLogs.length === 0 && <div className="text-center py-10 border border-dashed border-slate-800 rounded text-slate-700 font-mono text-[10px]">EMPTY_STREAM</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold neon-cyan uppercase italic">Subject_Matrix</h3>
            <NeonButton onClick={() => { setEditingStudent({ studentId: '', name: '', class: '', active: true }); setIsEditing(true); }}>新增對象</NeonButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students.map(s => (
              <GlassCard key={s.studentId} className="!p-6 flex flex-col justify-between hover:border-fcs-cyan transition-all">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono mb-2 tracking-tighter">UID: {s.studentId}</div>
                  <h4 className="text-lg font-bold mb-4">{s.name} <span className="text-xs text-slate-500 ml-2">({s.class})</span></h4>
                </div>
                <div className="flex gap-4 border-t border-white/5 pt-4">
                  <button onClick={() => { setEditingStudent(s); setIsEditing(true); }} className="text-[10px] text-fcs-cyan font-bold uppercase tracking-widest hover:neon-cyan">Modify</button>
                  <button onClick={() => setPurgeTarget(s.studentId)} className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline">Purge</button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="max-w-xl mx-auto py-20">
          <GlassCard className="text-center !border-fcs-magenta">
            <h3 className="text-lg font-bold text-fcs-magenta mb-4 uppercase italic">重置雲端鏈結</h3>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">此操作將初始化管理與解鎖密碼，並建立測試個案。</p>
            <NeonButton variant="magenta" className="w-full" onClick={handleRunInit} disabled={initStatus === 'running'}>
              {initStatus === 'running' ? '校準中...' : '執行系統初始化'}
            </NeonButton>
          </GlassCard>
        </div>
      )}

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#0f172a]/95 flex items-center justify-center p-6 backdrop-blur-md">
            <GlassCard className="max-w-md w-full">
              <h3 className="text-xl font-bold neon-cyan mb-6 uppercase italic">Entry_Protocol</h3>
              <HudInput label="Student_ID" value={editingStudent.studentId!} onChange={e => setEditingStudent({...editingStudent, studentId: e.target.value})} />
              <HudInput label="Name" value={editingStudent.name!} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
              <HudInput label="Class" value={editingStudent.class!} onChange={e => setEditingStudent({...editingStudent, class: e.target.value})} />
              <div className="flex gap-4 mt-8">
                <NeonButton className="flex-1" onClick={handleSaveStudent}>保存紀錄</NeonButton>
                <button onClick={() => setIsEditing(false)} className="flex-1 text-[10px] uppercase text-slate-500 font-mono tracking-widest">[ Abort ]</button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {purgeTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-red-950/90 flex items-center justify-center p-6 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-sm w-full bg-[#0f172a] border-2 border-red-500 p-8 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.3)]"
            >
              <div className="text-red-500 mb-6 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-red-500 mb-2 uppercase text-center italic">Termination</h3>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded mb-8 text-xs text-red-200 leading-relaxed">
                警告：一旦執行抹除，對象的所有雲端關聯數據與諮商日誌將被永久銷毀。
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={executePurge} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)]">執行核心抹除</button>
                <button onClick={() => setPurgeTarget(null)} className="w-full py-3 text-[10px] text-slate-500 hover:text-white uppercase font-bold font-mono tracking-widest">[ Abort ]</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

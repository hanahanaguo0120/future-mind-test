
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  getDoc,
  doc,
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { CounselingLog, Student, SystemConfig } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyClEB5oI2k4QYFXbPxzSO9J-r8NY_RUYTk",
  authDomain: "fcs-recod.firebaseapp.com",
  projectId: "fcs-recod",
  storageBucket: "fcs-recod.firebasestorage.app",
  messagingSenderId: "112344105758",
  appId: "1:112344105758:web:2d84c4afda008838ad3f0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getSystemConfig = async (): Promise<SystemConfig | null> => {
  try {
    const docRef = doc(db, "system_config", "access_keys");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as SystemConfig) : null;
  } catch (error) {
    return null;
  }
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "system_config", "access_keys"), {
      admin_password: "admin",
      unlock_password: "unlock"
    });
    const testId = "SYS-001";
    batch.set(doc(db, "students", testId), {
      studentId: testId,
      name: "系統測試員",
      class: "SYSTEM",
      active: true
    });
    await batch.commit();
  } catch (error) {
    throw error;
  }
};

/**
 * 實時監聽學生名單
 */
export const subscribeToStudents = (callback: (students: Student[]) => void) => {
  const q = query(collection(db, "students"), where("active", "==", true));
  return onSnapshot(q, (snap) => {
    const students = snap.docs.map(d => ({
      ...d.data(),
      studentId: d.id
    } as Student));
    callback(students);
  }, (error) => {
    console.error("FCS_SYNC_ERR:", error);
  });
};

export const getStudents = async (): Promise<Student[]> => {
  const q = query(collection(db, "students"), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), studentId: d.id } as Student));
};

export const upsertStudent = async (student: Student): Promise<void> => {
  const id = student.studentId.trim();
  if (!id) throw new Error("ID_REQUIRED");
  const studentRef = doc(db, "students", id);
  await setDoc(studentRef, { ...student, studentId: id, active: true }, { merge: true });
};

/**
 * 徹底抹除對象
 */
export const deleteStudent = async (docId: string): Promise<void> => {
  const studentRef = doc(db, "students", docId);
  try {
    await deleteDoc(studentRef);
    // 同步清理該學生的日誌
    const logsQuery = query(collection(db, "counseling_logs"), where("studentId", "==", docId));
    const logsSnap = await getDocs(logsQuery);
    const batch = writeBatch(db);
    logsSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (err: any) {
    console.error("FCS_DELETE_ERR:", err);
    throw err;
  }
};

export const addCounselingLog = async (logData: Omit<CounselingLog, 'timestamp' | 'logId'>): Promise<string> => {
  const docRef = await addDoc(collection(db, "counseling_logs"), {
    ...logData,
    timestamp: serverTimestamp()
  });
  return docRef.id;
};

/**
 * 獲取個案趨勢 - 優化版
 * 移除 Firestore 的 orderBy 以避免 Index 缺失導致查詢失敗，改在前端排序。
 */
export const getMoodTrends = async (studentId: string): Promise<CounselingLog[]> => {
  try {
    // 僅使用 studentId 過濾，不需要 Composite Index
    const q = query(collection(db, "counseling_logs"), where("studentId", "==", studentId));
    const snap = await getDocs(q);
    
    if (snap.empty) return [];

    const logs = snap.docs.map(d => ({ 
      logId: d.id, 
      ...d.data() 
    } as CounselingLog));

    // 在前端按時間排序 (由舊到新)
    return logs.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeA - timeB;
    });
  } catch (error: any) {
    console.error("FCS_QUERY_ERR [MoodTrends]:", error);
    // 如果是因為索引報錯，這裡會印出詳細原因
    return [];
  }
};

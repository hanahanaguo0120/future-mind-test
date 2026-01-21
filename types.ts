
/**
 * @file types.ts
 * FutureMind Counseling System - Data Schema Definitions
 */

// 1. Collection: students
export interface Student {
  studentId: string; // Unique School ID
  name: string;      // Student Name
  class: string;     // Class Name
  active: boolean;   // Soft delete flag
}

// 2. Collection: counseling_logs
export interface CounselingLog {
  logId?: string;       // Auto-generated string (Optional for new logs)
  studentId: string;    // Reference to students
  teacherId: string;    // Reference to the teacher
  moodScore: number;    // 1-10 integer
  content: string;      // The confidential text log
  timestamp: any;       // serverTimestamp (Firebase)
}

// 3. Collection: system_config
export interface SystemConfig {
  admin_password: string;
  unlock_password: string;
}

// 系統用戶 (教師/管理員)
export interface User {
  id: string;
  name: string;
  role: 'teacher' | 'admin';
}

// 系統應用狀態流程
export enum AppStatus {
  LOGIN = 'LOGIN',
  STUDENT_SELECT = 'STUDENT_SELECT',
  TERMINAL = 'TERMINAL',
  LOCKED = 'LOCKED',
  DASHBOARD = 'DASHBOARD'
}

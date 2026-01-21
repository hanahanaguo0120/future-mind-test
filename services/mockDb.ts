
import { Student, CounselingLog } from '../types';

// Mocked students data
const MOCK_STUDENTS: Student[] = [
  { studentId: 'S1001', name: '王小明', class: '3A', active: true },
  { studentId: 'S1002', name: '李華', class: '3B', active: true },
  { studentId: 'S1003', name: '張強', class: '2C', active: true },
  { studentId: 'S1004', name: '趙敏', class: '1A', active: true },
];

export const dbService = {
  getStudents: async (): Promise<Student[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_STUDENTS), 800);
    });
  },

  submitLog: async (log: CounselingLog): Promise<boolean> => {
    console.log('FCS [INTERNAL]: Encrypting and transmitting data...');
    console.log('FCS [LOG]:', log);
    return new Promise((resolve) => {
      // Simulate network latency
      setTimeout(() => resolve(true), 2000);
    });
  }
};

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type VerificationMethod = 'face_scan' | 'dynamic_qr' | 'manual' | 'kiosk' | 'rfid';

export type LeaveType = 'medical' | 'casual' | 'academic' | 'emergency';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  batch: string;
  semester: number;
  enrolledCourses: string[]; // course IDs
  faceRegistered: boolean;
  phone: string;
  guardianEmail: string;
  attendanceStats?: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
  };
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  facultyName: string;
  facultyId: string;
  credits: number;
  room: string;
  schedule: {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    startTime: string;
    endTime: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: AttendanceStatus;
  verificationMethod: VerificationMethod;
  confidence?: number; // 0 - 100 for face recognition
  location?: string;
  remarks?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  courseId?: string; // Optional if entire day
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'faculty' | 'department_head' | 'admin';
  avatar: string;
}

export interface AttendanceAlert {
  id: string;
  studentId: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  percentage: number;
  createdAt: string;
}

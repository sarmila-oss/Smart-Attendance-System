import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FacultyDashboard } from './components/FacultyDashboard';
import { StudentPortal } from './components/StudentPortal';
import { KioskTerminal } from './components/KioskTerminal';
import { FaceScanModal } from './components/FaceScanModal';
import { DynamicQrKiosk } from './components/DynamicQrKiosk';
import { 
  STUDENTS, 
  COURSES, 
  generateInitialRecords, 
  INITIAL_LEAVE_REQUESTS 
} from './data/mockData';
import { Student, Course, AttendanceRecord, LeaveRequest, AttendanceStatus, VerificationMethod } from './types';
import { calculateStudentAttendance } from './utils/helpers';
import { soundFX } from './utils/audio';

export const App: React.FC = () => {
  // State initialization with localStorage fallback
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('smart_attend_students');
      return saved ? JSON.parse(saved) : STUDENTS;
    } catch {
      return STUDENTS;
    }
  });

  const [courses] = useState<Course[]>(COURSES);

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('smart_attend_records');
      return saved ? JSON.parse(saved) : generateInitialRecords();
    } catch {
      return generateInitialRecords();
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem('smart_attend_leaves');
      return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  });

  const [currentTab, setCurrentTab] = useState<'faculty' | 'student' | 'kiosk'>('faculty');
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);
  const [isFaceScannerOpen, setIsFaceScannerOpen] = useState<boolean>(false);
  const [isQRKioskOpen, setIsQRKioskOpen] = useState<boolean>(false);
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || 'cs401');

  // Persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smart_attend_records', JSON.stringify(records));
    } catch {
      // safe catch
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('smart_attend_leaves', JSON.stringify(leaveRequests));
    } catch {
      // safe catch
    }
  }, [leaveRequests]);

  // Record Attendance from Face Scanner, QR, or Kiosk
  const handleRecordAttendance = (
    studentId: string,
    courseId: string,
    method: VerificationMethod,
    confidence?: number
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setRecords((prev) => {
      const existingIndex = prev.findIndex(
        r => r.studentId === studentId && r.courseId === courseId && r.date === today
      );

      const newRecord: AttendanceRecord = {
        id: `rec_${today}_${courseId}_${studentId}_${Date.now()}`,
        studentId,
        courseId,
        date: today,
        time,
        status: 'present',
        verificationMethod: method,
        confidence,
        location: 'Turing Hall Cam-01',
      };

      if (existingIndex >= 0) {
        // Update existing record for today
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: 'present',
          time,
          verificationMethod: method,
          confidence,
        };
        return updated;
      } else {
        return [newRecord, ...prev];
      }
    });
  };

  // Update specific record status manually
  const handleUpdateRecordStatus = (recordId: string, newStatus: AttendanceStatus) => {
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus } : r));
    soundFX.playBeep();
  };

  // Quick mark a student on the session table
  const handleQuickMarkStudent = (studentId: string, courseId: string, status: AttendanceStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setRecords((prev) => {
      const existing = prev.find(r => r.studentId === studentId && r.courseId === courseId && r.date === today);
      if (existing) {
        return prev.map(r => r.id === existing.id ? { ...r, status } : r);
      } else {
        const newRecord: AttendanceRecord = {
          id: `rec_${today}_${courseId}_${studentId}_${Date.now()}`,
          studentId,
          courseId,
          date: today,
          time,
          status,
          verificationMethod: 'manual',
        };
        return [newRecord, ...prev];
      }
    });

    soundFX.playBeep();
  };

  // Bulk mark all enrolled students present
  const handleBulkMarkPresent = (courseId: string, date: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const enrolledStudents = students.filter(s => s.enrolledCourses.includes(courseId));

    setRecords((prev) => {
      const updated = [...prev];
      enrolledStudents.forEach(s => {
        const idx = updated.findIndex(r => r.studentId === s.id && r.courseId === courseId && r.date === date);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], status: 'present' };
        } else {
          updated.push({
            id: `rec_${date}_${courseId}_${s.id}_${Date.now()}`,
            studentId: s.id,
            courseId,
            date,
            time,
            status: 'present',
            verificationMethod: 'manual',
          });
        }
      });
      return updated;
    });

    soundFX.playSuccess();
  };

  // Review leave request
  const handleReviewLeaveRequest = (requestId: string, status: 'approved' | 'rejected', comments?: string) => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id !== requestId) return l;
      return {
        ...l,
        status,
        reviewedBy: 'Dr. Sarah Mitchell',
        reviewedAt: new Date().toISOString(),
        comments,
      };
    }));

    if (status === 'approved') {
      const req = leaveRequests.find(l => l.id === requestId);
      if (req) {
        // Mark matching records in the leave period as 'excused'
        setRecords(prev => prev.map(r => {
          if (r.studentId === req.studentId && r.date >= req.startDate && r.date <= req.endDate) {
            return { ...r, status: 'excused' };
          }
          return r;
        }));
      }
    }

    soundFX.playSuccess();
  };

  // Student applies for leave
  const handleApplyLeave = (leaveData: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => {
    const newReq: LeaveRequest = {
      ...leaveData,
      id: `leave_${Date.now()}`,
      appliedAt: new Date().toISOString(),
      status: 'pending',
    };
    setLeaveRequests(prev => [newReq, ...prev]);
  };

  // Count pending leaves and low attendance students
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'pending').length;
  const lowAttendanceCount = students.filter(s => {
    const st = calculateStudentAttendance(s.id, records);
    return st.percentage < 75;
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        students={students}
        onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
        onOpenQRKiosk={() => setIsQRKioskOpen(true)}
        pendingLeavesCount={pendingLeavesCount}
        lowAttendanceCount={lowAttendanceCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'faculty' && (
          <FacultyDashboard
            students={students}
            courses={courses}
            records={records}
            leaveRequests={leaveRequests}
            onUpdateRecordStatus={handleUpdateRecordStatus}
            onQuickMarkStudent={handleQuickMarkStudent}
            onBulkMarkPresent={handleBulkMarkPresent}
            onReviewLeaveRequest={handleReviewLeaveRequest}
            onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
            onOpenQRKiosk={() => setIsQRKioskOpen(true)}
          />
        )}

        {currentTab === 'student' && (
          <StudentPortal
            student={selectedStudent}
            courses={courses}
            records={records}
            leaveRequests={leaveRequests}
            onApplyLeave={handleApplyLeave}
          />
        )}

        {currentTab === 'kiosk' && (
          <KioskTerminal
            students={students}
            courses={courses}
            records={records}
            onRecordAttendance={handleRecordAttendance}
            onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
            onOpenQRKiosk={() => setIsQRKioskOpen(true)}
          />
        )}

      </main>

      {/* AI Facial Recognition Scanner Modal */}
      <FaceScanModal
        isOpen={isFaceScannerOpen}
        onClose={() => setIsFaceScannerOpen(false)}
        students={students}
        courses={courses}
        activeCourseId={activeCourseId}
        onRecordAttendance={handleRecordAttendance}
      />

      {/* Dynamic Rotating QR Code Kiosk Modal */}
      <DynamicQrKiosk
        isOpen={isQRKioskOpen}
        onClose={() => setIsQRKioskOpen(false)}
        courses={courses}
        activeCourseId={activeCourseId}
        students={students}
        onRecordAttendance={(stuId, cId) => handleRecordAttendance(stuId, cId, 'dynamic_qr')}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>Smart Attendance System • Biometric Optical Vision & Touchless OTP Gateway • All Records Encrypted & Timestamped</p>
      </footer>

    </div>
  );
};

export default App;

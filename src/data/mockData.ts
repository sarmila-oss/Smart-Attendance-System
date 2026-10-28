import { Student, Course, AttendanceRecord, LeaveRequest, Faculty } from '../types';

export const INITIAL_FACULTY: Faculty = {
  id: 'fac_1',
  name: 'Dr. Sarah Mitchell',
  email: 's.mitchell@university.edu',
  department: 'Computer Science & AI',
  role: 'department_head',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
};

export const COURSES: Course[] = [
  {
    id: 'cs401',
    code: 'CS401',
    name: 'Advanced Machine Learning & Vision',
    department: 'Computer Science & AI',
    facultyName: 'Dr. Sarah Mitchell',
    facultyId: 'fac_1',
    credits: 4,
    room: 'Lab Turing 302',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
      { day: 'Friday', startTime: '11:00', endTime: '12:30' },
    ],
  },
  {
    id: 'cs302',
    code: 'CS302',
    name: 'Distributed Database Systems & Cloud',
    department: 'Computer Science & AI',
    facultyName: 'Prof. David Vance',
    facultyId: 'fac_2',
    credits: 3,
    room: 'Lecture Hall B-10',
    schedule: [
      { day: 'Tuesday', startTime: '10:30', endTime: '12:00' },
      { day: 'Thursday', startTime: '10:30', endTime: '12:00' },
    ],
  },
  {
    id: 'ai305',
    code: 'AI305',
    name: 'Natural Language Processing & LLMs',
    department: 'Computer Science & AI',
    facultyName: 'Dr. Sarah Mitchell',
    facultyId: 'fac_1',
    credits: 3,
    room: 'Computing Suite 4',
    schedule: [
      { day: 'Monday', startTime: '14:00', endTime: '15:30' },
      { day: 'Wednesday', startTime: '14:00', endTime: '15:30' },
    ],
  },
  {
    id: 'ec210',
    code: 'EC210',
    name: 'Embedded Systems & IoT Architecture',
    department: 'Electronics & Computer Eng',
    facultyName: 'Dr. Marcus Reynolds',
    facultyId: 'fac_3',
    credits: 4,
    room: 'Hardware Lab 105',
    schedule: [
      { day: 'Tuesday', startTime: '14:00', endTime: '15:30' },
      { day: 'Thursday', startTime: '14:00', endTime: '15:30' },
    ],
  },
];

export const STUDENTS: Student[] = [
  {
    id: 'stu_1',
    rollNo: '21CS101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'cs302', 'ai305'],
    faceRegistered: true,
    phone: '+1 555-0192',
    guardianEmail: 'p.sharma@family.net',
  },
  {
    id: 'stu_2',
    rollNo: '21CS102',
    name: 'Elena Rostova',
    email: 'elena.rostova@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'cs302', 'ai305', 'ec210'],
    faceRegistered: true,
    phone: '+1 555-0143',
    guardianEmail: 'rostova.fam@mail.com',
  },
  {
    id: 'stu_3',
    rollNo: '21CS103',
    name: 'Marcus Chen',
    email: 'marcus.chen@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'cs302', 'ec210'],
    faceRegistered: true,
    phone: '+1 555-0188',
    guardianEmail: 'w.chen@chenholdings.org',
  },
  {
    id: 'stu_4',
    rollNo: '21CS104',
    name: 'Priya Patel',
    email: 'priya.patel@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'cs302', 'ai305'],
    faceRegistered: true,
    phone: '+1 555-0176',
    guardianEmail: 'patel.p@yahoo.com',
  },
  {
    id: 'stu_5',
    rollNo: '21CS105',
    name: 'Liam O\'Connor',
    email: 'liam.oconnor@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'ai305', 'ec210'],
    faceRegistered: false,
    phone: '+1 555-0129',
    guardianEmail: 'm.oconnor@sky.net',
  },
  {
    id: 'stu_6',
    rollNo: '21CS106',
    name: 'Aisha Al-Mansoor',
    email: 'aisha.mansoor@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'cs302', 'ai305'],
    faceRegistered: true,
    phone: '+1 555-0155',
    guardianEmail: 'mansoor.family@gmail.com',
  },
  {
    id: 'stu_7',
    rollNo: '21CS107',
    name: 'Lucas Silva',
    email: 'lucas.silva@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'cs302', 'ec210'],
    faceRegistered: true,
    phone: '+1 555-0164',
    guardianEmail: 'silva.carla@brasil.br',
  },
  {
    id: 'stu_8',
    rollNo: '21CS108',
    name: 'Chloe Dubois',
    email: 'chloe.dubois@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
    batch: '2023-2027',
    semester: 6,
    enrolledCourses: ['cs401', 'ai305'],
    faceRegistered: true,
    phone: '+1 555-0112',
    guardianEmail: 'h.dubois@free.fr',
  },
];

// Helper to generate attendance for the past 14 days
export const generateInitialRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Create past dates
  for (let d = 14; d >= 0; d--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - d);
    const dayOfWeek = targetDate.getDay();
    // Skip Sundays
    if (dayOfWeek === 0) continue;

    const dateStr = targetDate.toISOString().split('T')[0];

    // CS401 runs Mon, Wed, Fri
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      STUDENTS.forEach((student, index) => {
        if (!student.enrolledCourses.includes('cs401')) return;

        // Simulate realistic attendance
        let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
        let method: 'face_scan' | 'dynamic_qr' | 'manual' | 'kiosk' = 'face_scan';
        let confidence = 96.5 + (index % 4);

        if (d === 0) {
          // Today: partial attendance for testing
          if (index === 0) { status = 'present'; method = 'face_scan'; }
          else if (index === 1) { status = 'present'; method = 'dynamic_qr'; }
          else if (index === 3) { status = 'late'; method = 'face_scan'; }
          else return; // Not marked yet
        } else {
          // Past days
          if ((index === 4 && d % 3 === 0) || (index === 6 && d % 4 === 0)) {
            status = 'absent';
          } else if (index === 2 && d === 4) {
            status = 'excused';
          } else if (index % 3 === 1 && d % 5 === 0) {
            status = 'late';
            method = 'dynamic_qr';
          } else {
            status = 'present';
            method = (index % 2 === 0) ? 'face_scan' : 'dynamic_qr';
          }
        }

        records.push({
          id: `rec_${dateStr}_cs401_${student.id}`,
          studentId: student.id,
          courseId: 'cs401',
          date: dateStr,
          time: status === 'late' ? '09:14:22' : '08:56:45',
          status,
          verificationMethod: method,
          confidence: status === 'present' || status === 'late' ? confidence : undefined,
          location: 'Turing Hall, Cam-01',
        });
      });
    }

    // CS302 runs Tue, Thu
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      STUDENTS.forEach((student, index) => {
        if (!student.enrolledCourses.includes('cs302')) return;
        let status: 'present' | 'absent' | 'late' = 'present';
        if (index === 4 && d % 2 === 0) status = 'absent';
        else if (index === 7 && d === 2) status = 'late';

        records.push({
          id: `rec_${dateStr}_cs302_${student.id}`,
          studentId: student.id,
          courseId: 'cs302',
          date: dateStr,
          time: '10:28:10',
          status,
          verificationMethod: index % 2 === 0 ? 'kiosk' : 'face_scan',
          confidence: 97.2,
          location: 'Lecture Hall B-10',
        });
      });
    }
  }

  return records;
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave_1',
    studentId: 'stu_3',
    courseId: 'cs401',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    leaveType: 'academic',
    reason: 'Representing university at ACM-ICPC Regional Programming Championship.',
    status: 'approved',
    appliedAt: new Date(Date.now() - 172800000).toISOString(),
    reviewedBy: 'Dr. Sarah Mitchell',
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    comments: 'Approved. Best of luck at the regionals!',
  },
  {
    id: 'leave_2',
    studentId: 'stu_5',
    courseId: 'cs401',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    leaveType: 'medical',
    reason: 'High fever and respiratory infection. Medical certificate attached.',
    status: 'pending',
    appliedAt: new Date().toISOString(),
  },
  {
    id: 'leave_3',
    studentId: 'stu_7',
    startDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 345600000).toISOString().split('T')[0],
    leaveType: 'casual',
    reason: 'Sister wedding ceremony in hometown.',
    status: 'pending',
    appliedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

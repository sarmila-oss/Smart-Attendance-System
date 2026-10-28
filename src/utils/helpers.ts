import confetti from 'canvas-confetti';
import { AttendanceRecord, Student } from '../types';

export function calculateStudentAttendance(
  studentId: string,
  records: AttendanceRecord[],
  courseId?: string
) {
  const filtered = records.filter(r => {
    if (r.studentId !== studentId) return false;
    if (courseId && r.courseId !== courseId) return false;
    return true;
  });

  const totalClasses = filtered.length;
  if (totalClasses === 0) {
    return { total: 0, attended: 0, late: 0, absent: 0, excused: 0, percentage: 100 };
  }

  const present = filtered.filter(r => r.status === 'present').length;
  const late = filtered.filter(r => r.status === 'late').length;
  const absent = filtered.filter(r => r.status === 'absent').length;
  const excused = filtered.filter(r => r.status === 'excused').length;

  // Excused is usually treated as neutral or attended depending on policy; we count present + excused + 0.8 * late
  const attendedCount = present + excused + (late * 0.8);
  const percentage = Math.round((attendedCount / totalClasses) * 100);

  return {
    total: totalClasses,
    attended: present,
    late,
    absent,
    excused,
    percentage: Math.min(100, Math.max(0, percentage)),
  };
}

export function getAttendanceStatusBadge(percentage: number) {
  if (percentage >= 80) {
    return {
      label: 'Good Standing',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'text-emerald-400',
    };
  }
  if (percentage >= 75) {
    return {
      label: 'Satisfactory',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      badge: 'text-blue-400',
    };
  }
  if (percentage >= 65) {
    return {
      label: 'Warning (<75%)',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badge: 'text-amber-400',
    };
  }
  return {
    label: 'Critical (<65%)',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    badge: 'text-rose-400',
  };
}

export function fireAttendanceConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
  });
}

export function exportAttendanceToCSV(
  records: AttendanceRecord[],
  students: Student[],
  filename = 'attendance_report.csv'
) {
  const studentMap = new Map(students.map(s => [s.id, s]));
  const headers = ['Record ID', 'Date', 'Time', 'Roll Number', 'Student Name', 'Course', 'Status', 'Verification Method', 'Confidence', 'Remarks'];

  const rows = records.map(r => {
    const s = studentMap.get(r.studentId);
    return [
      r.id,
      r.date,
      r.time,
      s?.rollNo || 'N/A',
      `"${s?.name || 'Unknown'}"`,
      r.courseId.toUpperCase(),
      r.status.toUpperCase(),
      r.verificationMethod,
      r.confidence ? `${r.confidence}%` : 'N/A',
      `"${r.remarks || ''}"`,
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

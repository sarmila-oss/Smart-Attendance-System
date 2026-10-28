import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Search, 
  Filter, 
  Sparkles, 
  ScanFace, 
  QrCode, 
  Send, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldAlert,
  Inbox,
  Check,
  X,
  UserCheck
} from 'lucide-react';
import { Student, Course, AttendanceRecord, LeaveRequest, AttendanceStatus } from '../types';
import { calculateStudentAttendance, exportAttendanceToCSV, getAttendanceStatusBadge } from '../utils/helpers';
import { soundFX } from '../utils/audio';

interface FacultyDashboardProps {
  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  onUpdateRecordStatus: (recordId: string, newStatus: AttendanceStatus) => void;
  onQuickMarkStudent: (studentId: string, courseId: string, status: AttendanceStatus) => void;
  onBulkMarkPresent: (courseId: string, date: string) => void;
  onReviewLeaveRequest: (requestId: string, status: 'approved' | 'rejected', comments?: string) => void;
  onOpenFaceScanner: () => void;
  onOpenQRKiosk: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  students,
  courses,
  records,
  leaveRequests,
  onUpdateRecordStatus,
  onQuickMarkStudent,
  onBulkMarkPresent,
  onReviewLeaveRequest,
  onOpenFaceScanner,
  onOpenQRKiosk,
}) => {
  const [activeTab, setActiveTab] = useState<'session' | 'records' | 'at_risk' | 'leaves'>('session');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'cs401');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warningSentToast, setWarningSentToast] = useState<string | null>(null);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Calculate high level KPIs
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === todayDateStr);
  const presentToday = todayRecords.filter(r => r.status === 'present').length;
  const lateToday = todayRecords.filter(r => r.status === 'late').length;
  const absentToday = todayRecords.filter(r => r.status === 'absent').length;
  const totalTodayMarked = todayRecords.length;

  const todayRate = totalTodayMarked > 0 
    ? Math.round(((presentToday + (lateToday * 0.8)) / totalTodayMarked) * 100) 
    : 89;

  // Compute at-risk students (<75%)
  const studentsWithStats = students.map(student => {
    const stats = calculateStudentAttendance(student.id, records);
    return { ...student, stats };
  });

  const atRiskStudents = studentsWithStats.filter(s => s.stats.percentage < 75);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

  // Filter records for the records table tab
  const filteredRecords = records.filter(record => {
    if (selectedCourseId !== 'all' && record.courseId !== selectedCourseId) return false;
    if (statusFilter !== 'all' && record.status !== statusFilter) return false;
    
    if (searchTerm) {
      const student = students.find(s => s.id === record.studentId);
      const term = searchTerm.toLowerCase();
      const matchName = student?.name.toLowerCase().includes(term);
      const matchRoll = student?.rollNo.toLowerCase().includes(term);
      if (!matchName && !matchRoll) return false;
    }
    return true;
  });

  // Get current session roster for the selected course
  const courseStudents = students.filter(s => s.enrolledCourses.includes(selectedCourseId));

  const handleSendWarning = (studentName: string, email: string) => {
    soundFX.playBeep();
    setWarningSentToast(`Official Attendance Notice dispatched to ${studentName} & ${email}`);
    setTimeout(() => setWarningSentToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Notification */}
      {warningSentToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900/90 border border-indigo-400 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center space-x-3 animate-in slide-in-from-bottom-3">
          <Send className="w-4 h-4 text-cyan-300" />
          <span className="text-xs font-medium">{warningSentToast}</span>
        </div>
      )}

      {/* Top Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        {/* KPI: Attendance Rate */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Rate</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{todayRate}%</span>
            <span className="text-xs font-semibold text-emerald-400">Target 85%+</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${todayRate}%` }} />
          </div>
        </div>

        {/* KPI: Present Today */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Present Today</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">{presentToday}</span>
            <span className="text-xs text-slate-400">Students</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Logged via AI Scan & QR</p>
        </div>

        {/* KPI: Late Arrivals */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Late Check-ins</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">{lateToday}</span>
            <span className="text-xs text-slate-400">&gt; 10m Grace</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Deducted 20% credit</p>
        </div>

        {/* KPI: Absent */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Absent Count</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">{absentToday}</span>
            <span className="text-xs text-slate-400">Unexcused</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Auto-notified guardians</p>
        </div>

        {/* KPI: At-Risk Students (<75%) */}
        <div 
          onClick={() => setActiveTab('at_risk')}
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 hover:border-rose-500/60 p-4 rounded-2xl relative cursor-pointer transition shadow-lg shadow-rose-950/20"
        >
          <div className="flex items-center justify-between text-xs text-rose-300">
            <span className="font-semibold">At-Risk (&lt;75%)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">{atRiskStudents.length}</span>
            <span className="text-xs text-rose-300/80">Action Req.</span>
          </div>
          <p className="text-[11px] text-rose-300/80 mt-2 flex items-center gap-1">
            <span>Review students</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

      </div>

      {/* Main Section Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('session')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'session'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Class Session</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'records'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance Log ({records.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('at_risk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 relative ${
              activeTab === 'at_risk'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>At-Risk Threshold</span>
            {atRiskStudents.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {atRiskStudents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 relative ${
              activeTab === 'leaves'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4 text-amber-400" />
            <span>Leave Requests</span>
            {pendingLeaves.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingLeaves.length}
              </span>
            )}
          </button>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenFaceScanner}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition"
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>Face Scanner</span>
          </button>

          <button
            onClick={onOpenQRKiosk}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 active:scale-95 transition"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>QR Kiosk</span>
          </button>
        </div>

      </div>

      {/* TAB 1: ACTIVE CLASS SESSION */}
      {activeTab === 'session' && (
        <div className="space-y-4">
          
          {/* Session Controller Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Select Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-medium rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="hidden lg:block border-l border-slate-800 pl-4">
                <span className="text-[11px] text-slate-400 block">Classroom & Room</span>
                <span className="text-xs font-mono font-semibold text-indigo-300">{selectedCourse.room}</span>
              </div>
            </div>

            {/* Quick Batch Automation */}
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={() => onBulkMarkPresent(selectedCourseId, selectedDate)}
                className="flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-semibold active:scale-95 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={onOpenFaceScanner}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 active:scale-95 transition"
              >
                <ScanFace className="w-3.5 h-3.5" />
                <span>Live Camera Scan</span>
              </button>
            </div>

          </div>

          {/* Student Roster Table for this Session */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Class Roster & Instant Marking</h4>
                <p className="text-xs text-slate-400">
                  {courseStudents.length} Students enrolled in {selectedCourse.code}
                </p>
              </div>
              <span className="text-xs text-indigo-400 font-medium">Click status pill to toggle manually</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Overall Standing</th>
                    <th className="py-3 px-4">Session Status</th>
                    <th className="py-3 px-4">Check-in Details</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {courseStudents.map((student) => {
                    // Find today's record if marked
                    const existingRecord = records.find(
                      r => r.studentId === student.id && r.courseId === selectedCourseId && r.date === selectedDate
                    );
                    const stats = calculateStudentAttendance(student.id, records);
                    const badge = getAttendanceStatusBadge(stats.percentage);

                    const currentStatus = existingRecord?.status || 'absent';

                    return (
                      <tr key={student.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <span className="font-semibold text-white text-sm block">{student.name}</span>
                            <span className="text-[11px] text-slate-400">{student.department}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300 font-medium">
                          {student.rollNo}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                              {stats.percentage}%
                            </span>
                            <span className="text-[11px] text-slate-400 hidden sm:inline">({stats.attended}/{stats.total})</span>
                          </div>
                        </td>

                        {/* Interactive Status Selector Pill */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
                            <button
                              onClick={() => onQuickMarkStudent(student.id, selectedCourseId, 'present')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => onQuickMarkStudent(student.id, selectedCourseId, 'late')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => onQuickMarkStudent(student.id, selectedCourseId, 'absent')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => onQuickMarkStudent(student.id, selectedCourseId, 'excused')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'excused'
                                  ? 'bg-blue-500 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>

                        {/* Check-in Method & Confidence */}
                        <td className="py-3 px-4">
                          {existingRecord ? (
                            <div className="text-xs">
                              <span className="font-mono text-slate-300">{existingRecord.time}</span>
                              <div className="text-[10px] text-slate-400 capitalize">
                                Via {existingRecord.verificationMethod.replace('_', ' ')}
                                {existingRecord.confidence && ` (${existingRecord.confidence}%)`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Pending</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onQuickMarkStudent(student.id, selectedCourseId, currentStatus === 'present' ? 'absent' : 'present')}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Toggle Status
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: COMPREHENSIVE ATTENDANCE LOGS */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name or roll..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Course select */}
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none"
              >
                <option value="all">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
                ))}
              </select>

              {/* Status select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused</option>
              </select>
            </div>

            {/* Export CSV action */}
            <button
              onClick={() => exportAttendanceToCSV(filteredRecords, students)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>

          </div>

          {/* Records Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {filteredRecords.length} Attendance Records</span>
              <span>Sorted by Most Recent</span>
            </div>

            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 sticky top-0 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRecords.map((record) => {
                    const student = students.find(s => s.id === record.studentId);
                    const course = courses.find(c => c.id === record.courseId);

                    return (
                      <tr key={record.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {record.date} <span className="text-slate-500">{record.time}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <img src={student?.avatar} alt={student?.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-medium text-white">{student?.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {student?.rollNo}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-indigo-300">{course?.code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-slate-300">
                            {record.verificationMethod.replace('_', ' ')}
                          </span>
                          {record.confidence && (
                            <span className="ml-1 text-[10px] text-cyan-400">({record.confidence}%)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            record.status === 'present'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : record.status === 'late'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : record.status === 'excused'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={record.status}
                            onChange={(e) => onUpdateRecordStatus(record.id, e.target.value as AttendanceStatus)}
                            className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs outline-none"
                          >
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                            <option value="excused">Excused</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: AT-RISK MONITOR (<75% THRESHOLD) */}
      {activeTab === 'at_risk' && (
        <div className="space-y-4">
          
          <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Debarment Alert Threshold (&lt;75% Attendance)</h4>
                <p className="text-xs text-rose-200/80">
                  Students below the statutory 75% cutoff cannot appear for final semester examinations.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {atRiskStudents.map((student) => {
              const stats = student.stats;
              // How many consecutive classes needed to reach 75%
              // (attended + x) / (total + x) >= 0.75 => x = (0.75*total - attended) / 0.25
              const needed = Math.max(0, Math.ceil((0.75 * stats.total - stats.attended) / 0.25));

              return (
                <div key={student.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-500/50" />
                        <div>
                          <h5 className="font-bold text-white text-sm">{student.name}</h5>
                          <p className="text-xs font-mono text-slate-400">{student.rollNo} • Sem {student.semester}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {stats.percentage}%
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Attended Classes:</span>
                        <span className="text-white font-medium">{stats.attended} of {stats.total}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total Absent:</span>
                        <span className="text-rose-400 font-semibold">{stats.absent} classes</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Recovery Need:</span>
                        <span className="text-amber-400 font-bold">Attend {needed} consecutive classes</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Guardian Contact:</span>
                        <span className="text-slate-300 font-mono text-[11px] truncate max-w-[150px]">{student.guardianEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleSendWarning(student.name, student.guardianEmail)}
                      className="w-full flex items-center justify-center space-x-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 py-2 rounded-xl text-xs font-semibold active:scale-95 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Issue Attendance Warning Notice</span>
                    </button>
                  </div>

                </div>
              );
            })}

            {atRiskStudents.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-white text-sm">All Students Above Threshold</p>
                <p className="text-xs">No students currently in warning or critical status.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: LEAVE REQUESTS HUB */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">Student Medical & Duty Leave Applications</h4>
              <p className="text-xs text-slate-400">Approved leaves are automatically converted to excused attendance.</p>
            </div>
            <span className="text-xs text-amber-400 font-semibold">{pendingLeaves.length} Pending Review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveRequests.map((req) => {
              const student = students.find(s => s.id === req.studentId);
              const course = courses.find(c => c.id === req.courseId);

              return (
                <div key={req.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={student?.avatar} alt={student?.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <h5 className="font-bold text-white text-sm">{student?.name}</h5>
                          <span className="text-xs text-slate-400 font-mono">{student?.rollNo}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="mt-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <span className="text-slate-400">Period:</span>
                        <span className="font-semibold">{req.startDate}</span>
                        <span className="text-slate-500">to</span>
                        <span className="font-semibold">{req.endDate}</span>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-400">Category: </span>
                        <span className="font-semibold text-indigo-300 capitalize">{req.leaveType}</span>
                        {course && <span className="text-slate-400"> • Course: {course.code}</span>}
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs italic mt-2">
                        "{req.reason}"
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
                      <button
                        onClick={() => onReviewLeaveRequest(req.id, 'approved', 'Approved by faculty')}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Leave</span>
                      </button>
                      <button
                        onClick={() => onReviewLeaveRequest(req.id, 'rejected', 'Insufficient justification')}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 py-2 rounded-xl text-xs font-semibold active:scale-95 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Reviewed by: {req.reviewedBy || 'Faculty'}</span>
                      <span className="italic">{req.comments}</span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BookOpen, 
  FileText, 
  PlusCircle, 
  X, 
  Send,
  Calculator,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Student, Course, AttendanceRecord, LeaveRequest, LeaveType } from '../types';
import { calculateStudentAttendance, getAttendanceStatusBadge } from '../utils/helpers';
import { soundFX } from '../utils/audio';

interface StudentPortalProps {
  student: Student;
  courses: Course[];
  records: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  onApplyLeave: (leave: Omit<LeaveRequest, 'id' | 'appliedAt' | 'status'>) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  courses,
  records,
  leaveRequests,
  onApplyLeave,
}) => {
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  
  // Leave Form state
  const [leaveCourseId, setLeaveCourseId] = useState<string>('');
  const [leaveType, setLeaveType] = useState<LeaveType>('medical');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');

  const enrolledCourseObjects = courses.filter(c => student.enrolledCourses.includes(c.id));
  const overallStats = calculateStudentAttendance(student.id, records);
  const overallBadge = getAttendanceStatusBadge(overallStats.percentage);

  // Student personal leaves
  const myLeaves = leaveRequests.filter(l => l.studentId === student.id);

  // Filtered personal records
  const myRecords = records.filter(r => {
    if (r.studentId !== student.id) return false;
    if (selectedCourseFilter !== 'all' && r.courseId !== selectedCourseFilter) return false;
    return true;
  });

  // Calculate classes needed to hit 75%
  const classesNeededFor75 = Math.max(0, Math.ceil((0.75 * overallStats.total - overallStats.attended) / 0.25));
  // Calculate buffer classes they can safely miss and still remain >= 75%
  const safeClassesToMiss = overallStats.percentage > 75 
    ? Math.floor((overallStats.attended - 0.75 * overallStats.total) / 0.75)
    : 0;

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onApplyLeave({
      studentId: student.id,
      courseId: leaveCourseId || undefined,
      startDate,
      endDate,
      leaveType,
      reason,
    });

    soundFX.playSuccess();
    setShowLeaveModal(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Student Profile & Attendance Milestone Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Identity */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1" title="Face Registered & Active">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{student.name}</h2>
                <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                  {student.rollNo}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {student.department} • Batch {student.batch} • Semester {student.semester}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-400">
                <span>Email: <strong className="text-slate-300">{student.email}</strong></span>
                <span>•</span>
                <span>Enrolled: <strong className="text-indigo-300">{enrolledCourseObjects.length} Subjects</strong></span>
              </div>
            </div>
          </div>

          {/* Large Overall Gauge Card */}
          <div className="flex items-center space-x-5 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl w-full md:w-auto">
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={201}
                  strokeDashoffset={201 - (201 * overallStats.percentage) / 100}
                  strokeLinecap="round"
                  className={
                    overallStats.percentage >= 75
                      ? 'text-emerald-500'
                      : overallStats.percentage >= 65
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-extrabold text-white font-mono">{overallStats.percentage}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Overall</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${overallBadge.color}`}>
                {overallBadge.label}
              </span>
              <p className="text-xs text-slate-400">
                Attended: <strong className="text-white">{overallStats.attended}</strong> of <strong className="text-white">{overallStats.total}</strong> classes
              </p>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Apply for Medical / Casual Leave</span>
              </button>
            </div>

          </div>

        </div>

        {/* Attendance Safe Guard Calculator Pill */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Calculator className="w-4 h-4 text-cyan-400 shrink-0" />
            {overallStats.percentage < 75 ? (
              <span className="text-rose-300">
                <strong>Attention:</strong> You are currently below the required 75% cutoff. You must attend the next{' '}
                <strong className="underline font-bold text-amber-300">{classesNeededFor75} classes</strong> without absence to become exam eligible!
              </span>
            ) : (
              <span className="text-emerald-300">
                <strong>On Track:</strong> You are safely above the 75% threshold. You can miss up to{' '}
                <strong className="underline font-bold text-emerald-200">{safeClassesToMiss} lectures</strong> and remain safe.
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Min. Statutory Threshold: 75%</span>
        </div>

      </div>

      {/* Course Breakdown Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Enrolled Subjects & Attendance Health</span>
          </h3>
          <span className="text-xs text-slate-400">{enrolledCourseObjects.length} Active Courses</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledCourseObjects.map((course) => {
            const courseStats = calculateStudentAttendance(student.id, records, course.id);
            const badge = getAttendanceStatusBadge(courseStats.percentage);

            return (
              <div
                key={course.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                        {course.code}
                      </span>
                      <h4 className="font-bold text-white text-sm line-clamp-1 mt-0.5">{course.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">Faculty: {course.facultyName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.color}`}>
                      {courseStats.percentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Lectures: {courseStats.attended} / {courseStats.total}</span>
                      <span className="font-mono text-slate-300">
                        {courseStats.absent > 0 ? `${courseStats.absent} missed` : 'Full Attendance'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          courseStats.percentage >= 75
                            ? 'bg-emerald-500'
                            : courseStats.percentage >= 65
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${courseStats.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Room: {course.room}</span>
                    <span>{course.credits} Credits</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-semibold ${badge.badge}`}>{badge.label}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Application History & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-white text-sm">My Leave Applications & Permissions</h4>
          </div>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </button>
        </div>

        {myLeaves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myLeaves.map(leave => (
              <div key={leave.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white capitalize">{leave.leaveType} Leave</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    leave.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : leave.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {leave.status}
                  </span>
                </div>
                <div className="mt-1 text-slate-400">
                  {leave.startDate} to {leave.endDate}
                </div>
                <p className="mt-2 text-slate-300 italic">"{leave.reason}"</p>
                {leave.comments && (
                  <p className="mt-1.5 text-[11px] text-emerald-400">Faculty: {leave.comments}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">No leave applications filed yet.</p>
        )}
      </div>

      {/* Personal Attendance History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-white text-sm">Personal Attendance Timeline</h4>
            <p className="text-xs text-slate-400">Every check-in log and method record</p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Filter Course:</span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none"
            >
              <option value="all">All Courses</option>
              {enrolledCourseObjects.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 sticky top-0 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Verification</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {myRecords.map((r) => {
                const c = courses.find(course => course.id === r.courseId);
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 font-mono text-slate-300">{r.date}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{r.time}</td>
                    <td className="py-2.5 px-4 font-semibold text-indigo-300">{c?.code || r.courseId}</td>
                    <td className="py-2.5 px-4 capitalize text-slate-400">
                      {r.verificationMethod.replace('_', ' ')}
                      {r.confidence && <span className="text-cyan-400 ml-1">({r.confidence}%)</span>}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'present'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : r.status === 'late'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : r.status === 'excused'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Submit Leave Request</span>
              </h4>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none"
                >
                  <option value="medical">Medical (Illness / Hospitalization)</option>
                  <option value="casual">Casual Leave</option>
                  <option value="academic">Official Academic / Competition Duty</option>
                  <option value="emergency">Family Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specific Course (Optional)</label>
                <select
                  value={leaveCourseId}
                  onChange={(e) => setLeaveCourseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none"
                >
                  <option value="">All Courses on that day</option>
                  {enrolledCourseObjects.map(c => (
                    <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Reason & Description</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief justification or medical symptom description..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-semibold shadow-md active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

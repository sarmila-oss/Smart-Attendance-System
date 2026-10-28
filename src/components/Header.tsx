import React, { useState, useEffect } from 'react';
import { 
  ScanFace, 
  QrCode, 
  Users, 
  GraduationCap, 
  Bell, 
  Clock, 
  ShieldCheck, 
  MonitorSmartphone,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { Student } from '../types';

interface HeaderProps {
  currentTab: 'faculty' | 'student' | 'kiosk';
  setCurrentTab: (tab: 'faculty' | 'student' | 'kiosk') => void;
  selectedStudent: Student;
  setSelectedStudent: (student: Student) => void;
  students: Student[];
  onOpenFaceScanner: () => void;
  onOpenQRKiosk: () => void;
  pendingLeavesCount: number;
  lowAttendanceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedStudent,
  setSelectedStudent,
  students,
  onOpenFaceScanner,
  onOpenQRKiosk,
  pendingLeavesCount,
  lowAttendanceCount,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = pendingLeavesCount + lowAttendanceCount;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">SmartAttend</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                  AI Vision 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Biometric & QR Attendance</p>
            </div>
          </div>

          {/* Quick Realtime Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('faculty')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Faculty & Admin</span>
              <span className="md:hidden">Admin</span>
            </button>

            <button
              onClick={() => setCurrentTab('student')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden md:inline">Student Portal</span>
              <span className="md:hidden">Student</span>
            </button>

            <button
              onClick={() => setCurrentTab('kiosk')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'kiosk'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MonitorSmartphone className="w-4 h-4" />
              <span>Door Kiosk</span>
            </button>
          </nav>

          {/* Action Tools & Status */}
          <div className="flex items-center space-x-3">
            
            {/* Live Clock */}
            <div className="hidden xl:flex items-center space-x-2 px-3 py-1 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{date}</span>
              <span className="font-mono text-indigo-300 font-semibold">{time}</span>
            </div>

            {/* Quick Face Scan trigger */}
            <button
              onClick={onOpenFaceScanner}
              title="Launch AI Face Recognition Scanner"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition shadow-md shadow-indigo-500/25 active:scale-95"
            >
              <ScanFace className="w-4 h-4" />
              <span className="hidden sm:inline">Face Scanner</span>
            </button>

            {/* Quick QR code kiosk */}
            <button
              onClick={onOpenQRKiosk}
              title="Generate Dynamic QR Code"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-slate-700 transition active:scale-95"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">QR Kiosk</span>
            </button>

            {/* Notification Alert center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Dropdown notification drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</span>
                    <span className="text-[10px] text-slate-400">{totalAlerts} Active</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {pendingLeavesCount > 0 && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start space-x-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                        <div>
                          <p className="font-semibold">{pendingLeavesCount} Pending Leave Requests</p>
                          <p className="text-[11px] text-amber-200/70">Awaiting faculty or department approval.</p>
                        </div>
                      </div>
                    )}
                    {lowAttendanceCount > 0 && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0" />
                        <div>
                          <p className="font-semibold">{lowAttendanceCount} Students Below 75% Cutoff</p>
                          <p className="text-[11px] text-rose-200/70">At risk of exam debarment.</p>
                        </div>
                      </div>
                    )}
                    {totalAlerts === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs">
                        All systems operational. No active warnings.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Student Picker if in student tab */}
            {currentTab === 'student' && (
              <div className="relative group">
                <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-lg cursor-pointer">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-400"
                  />
                  <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate hidden sm:inline">
                    {selectedStudent.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50">
                  <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase">
                    Switch Student Profile
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {students.map((stu) => (
                      <button
                        key={stu.id}
                        onClick={() => setSelectedStudent(stu)}
                        className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs transition ${
                          selectedStudent.id === stu.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <img src={stu.avatar} alt={stu.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate text-left flex-1">{stu.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">{stu.rollNo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

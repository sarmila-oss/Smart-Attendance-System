import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Course, Student } from '../types';
import { soundFX } from '../utils/audio';
import { fireAttendanceConfetti } from '../utils/helpers';

interface DynamicQrKioskProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  activeCourseId: string;
  students: Student[];
  onRecordAttendance: (
    studentId: string,
    courseId: string,
    method: 'dynamic_qr'
  ) => void;
}

export const DynamicQrKiosk: React.FC<DynamicQrKioskProps> = ({
  isOpen,
  onClose,
  courses,
  activeCourseId,
  students,
  onRecordAttendance,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>(activeCourseId || courses[0]?.id || 'cs401');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [qrToken, setQrToken] = useState<string>('ATTEND-SEC-9921-X');
  const [recentCheckedIn, setRecentCheckedIn] = useState<Student | null>(null);
  const [studentToSimulate, setStudentToSimulate] = useState<string>(students[0]?.id || '');

  // Cycle rotating QR token every 15 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const newToken = `ATTEND-SEC-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
          setQrToken(newToken);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCourse = courses.find(c => c.id === selectedCourse) || courses[0];

  const handleSimulateScan = () => {
    const student = students.find(s => s.id === studentToSimulate) || students[0];
    if (!student) return;

    setRecentCheckedIn(student);
    soundFX.playSuccess();
    fireAttendanceConfetti();
    onRecordAttendance(student.id, selectedCourse, 'dynamic_qr');

    setTimeout(() => {
      setRecentCheckedIn(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Touchless Dynamic QR Kiosk
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  Anti-Spoofing Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Rotating OTP code refreshes automatically every 15 seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Filter */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Class:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Room: {currentCourse?.room} (Geo-Fenced)</span>
          </div>
        </div>

        {/* QR Display Center */}
        <div className="p-8 flex flex-col items-center justify-center bg-slate-950">
          
          <div className="relative p-6 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
            {/* SVG Visual Dynamic QR */}
            <div className="w-56 h-56 relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                {/* 3 corner position markers */}
                <rect x="5" y="5" width="28" height="28" rx="4" />
                <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="13" width="12" height="12" rx="1" />

                <rect x="67" y="5" width="28" height="28" rx="4" />
                <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                <rect x="75" y="13" width="12" height="12" rx="1" />

                <rect x="5" y="67" width="28" height="28" rx="4" />
                <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                <rect x="13" y="75" width="12" height="12" rx="1" />

                {/* Simulated data matrix cells */}
                <rect x="38" y="10" width="8" height="8" />
                <rect x="50" y="10" width="8" height="8" />
                <rect x="38" y="24" width="8" height="8" />
                <rect x="50" y="24" width="8" height="8" />

                <rect x="10" y="38" width="8" height="8" />
                <rect x="24" y="38" width="8" height="8" />
                <rect x="10" y="50" width="8" height="8" />
                <rect x="24" y="50" width="8" height="8" />

                <rect x="38" y="38" width="24" height="24" fill="#06b6d4" rx="4" />
                <circle cx="50" cy="50" r="6" fill="white" />

                <rect x="68" y="38" width="8" height="8" />
                <rect x="80" y="50" width="8" height="8" />
                <rect x="38" y="68" width="8" height="8" />
                <rect x="52" y="76" width="8" height="8" />
                <rect x="68" y="68" width="12" height="12" />
                <rect x="82" y="82" width="8" height="8" />
              </svg>

              {/* Dynamic Overlay Ping */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="w-12 h-12 rounded-full border-2 border-cyan-500 animate-ping opacity-30" />
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                {qrToken}
              </span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="mt-4 flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full">
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${timeLeft <= 3 ? 'animate-spin' : ''}`} />
            <span>Token expires in: <strong className="font-mono text-cyan-400 text-sm">{timeLeft}s</strong></span>
          </div>

          {/* Feedback notification when scanned */}
          {recentCheckedIn && (
            <div className="mt-4 w-full max-w-md bg-emerald-950/90 border border-emerald-500 rounded-xl p-3 flex items-center justify-between text-xs animate-in zoom-in-95">
              <div className="flex items-center space-x-3">
                <img src={recentCheckedIn.avatar} alt={recentCheckedIn.name} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400" />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">{recentCheckedIn.name}</span>
                  </div>
                  <span className="text-emerald-300/80 font-mono text-[11px]">{recentCheckedIn.rollNo} • QR Check-in Validated</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">PRESENT</span>
            </div>
          )}

        </div>

        {/* Student Mobile Scan Simulator Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-300">Simulate Student Phone:</span>
            <select
              value={studentToSimulate}
              onChange={(e) => setStudentToSimulate(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-cyan-500 outline-none flex-1 sm:flex-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSimulateScan}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-cyan-500/20 active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Mobile Scan</span>
          </button>
        </div>

      </div>
    </div>
  );
};

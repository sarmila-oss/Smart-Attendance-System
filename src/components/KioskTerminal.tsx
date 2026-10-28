import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  MapPin,
  Maximize2
} from 'lucide-react';
import { Course, Student, AttendanceRecord } from '../types';
import { soundFX } from '../utils/audio';
import { fireAttendanceConfetti } from '../utils/helpers';

interface KioskTerminalProps {
  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
  onRecordAttendance: (
    studentId: string,
    courseId: string,
    method: 'face_scan' | 'dynamic_qr' | 'kiosk',
    confidence?: number
  ) => void;
  onOpenFaceScanner: () => void;
  onOpenQRKiosk: () => void;
}

export const KioskTerminal: React.FC<KioskTerminalProps> = ({
  students,
  courses,
  records,
  onRecordAttendance,
  onOpenFaceScanner,
  onOpenQRKiosk,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || 'cs401');
  const [qrCounter, setQrCounter] = useState<number>(15);
  const [qrToken, setQrToken] = useState<string>('GATE-PASS-8842');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [quickCheckinStudentId, setQuickCheckinStudentId] = useState<string>(students[0]?.id || '');
  const [lastCheckinToast, setLastCheckinToast] = useState<{ student: Student; time: string; method: string } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // QR token rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQrCounter(prev => {
        if (prev <= 1) {
          setQrToken(`GATE-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).slice(-3).toUpperCase()}`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];

  // Recent 6 check-in records
  const recentRecords = [...records].reverse().slice(0, 6);

  const handleInstantKioskCheckin = (student: Student) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    onRecordAttendance(student.id, activeCourseId, 'kiosk', 98.9);
    
    if (!isAudioMuted) {
      soundFX.playSuccess();
    }
    fireAttendanceConfetti();

    setLastCheckinToast({
      student,
      time: nowTime,
      method: 'Kiosk Facial Recognition',
    });

    setTimeout(() => {
      setLastCheckinToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Kiosk Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-tight">DOOR ATTENDANCE TERMINAL</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-400">Station Kiosk #01 • Main Engineering Hallway</p>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="text-center md:text-right">
          <div className="text-2xl sm:text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300">
            {time}
          </div>
          <div className="text-xs text-slate-400 font-medium">{date}</div>
        </div>

      </div>

      {/* Active Session & Audio Control Strip */}
      <div className="bg-slate-950/70 border border-slate-800 px-5 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Active Gate Session:</span>
          <select
            value={activeCourseId}
            onChange={(e) => setActiveCourseId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white font-medium rounded-xl px-3 py-1.5 outline-none"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code}: {c.name} ({c.room})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Room: {activeCourse.room}</span>
          </div>
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isAudioMuted ? 'Muted' : 'Audio Alert On'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual Kiosk Terminal Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Terminal Station 1: AI Facial Recognition Scan Station */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Station A: AI Face Scan</h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                READY
              </span>
            </div>

            {/* Visual Screen Viewport */}
            <div className="mt-5 relative w-full aspect-16/10 rounded-2xl bg-slate-950 border-2 border-indigo-500/30 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              
              <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-cyan-400/60 flex items-center justify-center mb-3">
                <Camera className="w-10 h-10 text-cyan-400/80 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-25" />
              </div>

              <h4 className="font-bold text-white text-sm">Position Face In Front of Screen</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Smart dual-sensor AI automatically detects registered face & marks attendance in &lt; 0.5s.
              </p>

              {/* Instant Launch Action Button */}
              <button
                onClick={onOpenFaceScanner}
                className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/30 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Fullscreen Camera Scanner</span>
              </button>

            </div>
          </div>

          {/* Quick Check-in Simulator Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Walk-in Simulation (Tap a student to simulate stepping in front of scanner):
            </span>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {students.slice(0, 5).map(stu => (
                <button
                  key={stu.id}
                  onClick={() => handleInstantKioskCheckin(stu)}
                  className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 transition shrink-0 active:scale-95"
                >
                  <img src={stu.avatar} alt={stu.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{stu.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Terminal Station 2: Touchless Rotating QR Code Kiosk */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Station B: Touchless QR Gateway</h3>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="font-mono text-cyan-400 font-bold">{qrCounter}s</span>
              </div>
            </div>

            {/* QR Viewport */}
            <div className="mt-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
              
              <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center">
                <svg viewBox="0 0 100 100" className="w-40 h-40 text-slate-900" fill="currentColor">
                  <rect x="5" y="5" width="28" height="28" rx="4" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="13" width="12" height="12" rx="1" />

                  <rect x="67" y="5" width="28" height="28" rx="4" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="75" y="13" width="12" height="12" rx="1" />

                  <rect x="5" y="67" width="28" height="28" rx="4" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="75" width="12" height="12" rx="1" />

                  <rect x="38" y="10" width="8" height="8" />
                  <rect x="50" y="24" width="8" height="8" />
                  <rect x="10" y="38" width="8" height="8" />
                  <rect x="24" y="50" width="8" height="8" />
                  <rect x="38" y="38" width="24" height="24" fill="#6366f1" rx="4" />
                  <circle cx="50" cy="50" r="6" fill="white" />
                  <rect x="68" y="38" width="8" height="8" />
                  <rect x="38" y="68" width="12" height="12" />
                  <rect x="68" y="68" width="12" height="12" />
                </svg>

                <div className="mt-2 text-center">
                  <span className="font-mono text-[11px] font-bold text-slate-800 tracking-wider">
                    {qrToken}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 text-center max-w-xs">
                Scan using the university student companion web app with geofence check.
              </p>

              <button
                onClick={onOpenQRKiosk}
                className="mt-3 flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>Open Dedicated QR Broadcast Screen</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Campus Geo-Fence: Within 50m</span>
            </span>
            <span className="font-mono text-[11px]">Sync: 0.1s latency</span>
          </div>

        </div>

      </div>

      {/* Live Recent Check-in Feed Ticker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Live Terminal Check-in Feed</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Updated in Real-time</span>
        </div>

        {lastCheckinToast && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 flex items-center justify-between animate-in zoom-in-95 shadow-xl shadow-emerald-950/40">
            <div className="flex items-center space-x-4">
              <img src={lastCheckinToast.student.avatar} alt={lastCheckinToast.student.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400" />
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h5 className="font-bold text-white text-base">{lastCheckinToast.student.name}</h5>
                </div>
                <p className="text-xs text-emerald-200/80 font-mono">
                  {lastCheckinToast.student.rollNo} • Verified via {lastCheckinToast.method}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold uppercase tracking-wider">
                PRESENT
              </span>
              <div className="text-[11px] font-mono text-emerald-400 mt-1">{lastCheckinToast.time}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {recentRecords.map(rec => {
            const student = students.find(s => s.id === rec.studentId);
            const course = courses.find(c => c.id === rec.courseId);

            return (
              <div key={rec.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs">
                <img src={student?.avatar} alt={student?.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{student?.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{student?.rollNo} • {course?.code}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase ${
                    rec.status === 'present' ? 'text-emerald-400' : rec.status === 'late' ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {rec.status}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">{rec.time.slice(0, 5)}</div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

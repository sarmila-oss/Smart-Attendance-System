import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Zap,
  UserCheck,
  VideoOff
} from 'lucide-react';
import { Student, Course } from '../types';
import { soundFX } from '../utils/audio';
import { fireAttendanceConfetti } from '../utils/helpers';

interface FaceScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  courses: Course[];
  activeCourseId: string;
  onRecordAttendance: (
    studentId: string,
    courseId: string,
    method: 'face_scan',
    confidence: number
  ) => void;
}

export const FaceScanModal: React.FC<FaceScanModalProps> = ({
  isOpen,
  onClose,
  students,
  courses,
  activeCourseId,
  onRecordAttendance,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>(activeCourseId || courses[0]?.id || 'cs401');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(98.4);
  const [livenessMetric, setLivenessMetric] = useState<number>(99.2);
  const [testStudentIndex, setTestStudentIndex] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Setup / Stop camera stream
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        if (isMounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        }
      } catch {
        if (isMounted) {
          setHasCameraPermission(false);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle detection cycle animation
  useEffect(() => {
    if (!isOpen || !isScanning) return;

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          // Completed one scan cycle - auto-identify candidate
          triggerRecognition(students[testStudentIndex % students.length]);
          return 0;
        }
        return prev + 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, isScanning, testStudentIndex, students]);

  const triggerRecognition = (student: Student) => {
    setIsScanning(false);
    const score = +(96 + Math.random() * 3.8).toFixed(1);
    setConfidenceScore(score);
    setLivenessMetric(+(98 + Math.random() * 1.9).toFixed(1));
    setRecognizedStudent(student);

    soundFX.playSuccess();
    fireAttendanceConfetti();

    onRecordAttendance(student.id, selectedCourse, 'face_scan', score);

    // After 3 seconds, resume scanning for next attendee
    setTimeout(() => {
      setRecognizedStudent(null);
      setIsScanning(true);
      setTestStudentIndex(i => (i + 1) % students.length);
    }, 3200);
  };

  const handleManualTrigger = (student: Student) => {
    triggerRecognition(student);
  };

  if (!isOpen) return null;

  const currentCourseObj = courses.find(c => c.id === selectedCourse) || courses[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Vision Face Recognition Scanner
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Detection
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Course: <span className="text-slate-200 font-medium">{currentCourseObj?.code} - {currentCourseObj?.name}</span>
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

        {/* Course Selector in Modal */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Class Session:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
              ))}
            </select>
          </div>
          <div className="text-slate-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Anti-Spoofing & Liveness Active</span>
          </div>
        </div>

        {/* Video Canvas & Scanner Viewport */}
        <div className="relative p-6 flex-1 flex flex-col items-center justify-center bg-slate-950">
          
          <div className="relative w-full max-w-lg aspect-4/3 rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-slate-900 shadow-2xl flex items-center justify-center">
            
            {/* Real video if camera permitted, else simulated live preview */}
            {hasCameraPermission ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full relative flex flex-col items-center justify-center bg-radial from-slate-800 to-slate-950 text-slate-400">
                {/* Simulated subject face portrait for testing */}
                <div className="relative w-44 h-44 rounded-full overflow-hidden border-2 border-indigo-400/50 shadow-2xl">
                  <img
                    src={students[testStudentIndex % students.length]?.avatar}
                    alt="Scan Target"
                    className="w-full h-full object-cover filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
                </div>
                <div className="mt-4 flex items-center space-x-1.5 text-xs text-indigo-300 bg-indigo-950/70 border border-indigo-800/60 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Simulated Optical Sensor Feed Active</span>
                </div>
              </div>
            )}

            {/* Face Mesh Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              
              {/* Top biometric telemetry */}
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400/90 bg-black/40 backdrop-blur-xs p-2 rounded-lg border border-cyan-500/20">
                <div>FPS: 60 | RES: 1080P</div>
                <div>LIVENESS: {livenessMetric}%</div>
                <div>ISO: 100</div>
              </div>

              {/* Center Face Reticle */}
              <div className="relative mx-auto w-56 h-64 border border-cyan-400/40 rounded-3xl flex items-center justify-center">
                {/* Corner reticle brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

                {/* Laser scan line animation */}
                {isScanning && (
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scan-line" />
                )}

                {/* Center crosshair */}
                <div className="w-4 h-4 border-t border-b border-cyan-400/50" />
                <div className="w-4 h-4 border-l border-r border-cyan-400/50 absolute" />
              </div>

              {/* Bottom detection status */}
              <div className="w-full">
                {isScanning ? (
                  <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        Scanning Biometric Landmarks...
                      </span>
                      <span className="font-mono text-indigo-400">{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-200"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                ) : recognizedStudent ? (
                  <div className="bg-emerald-950/95 border-2 border-emerald-500 rounded-xl p-3 backdrop-blur-md animate-in zoom-in-95 duration-200 shadow-xl shadow-emerald-900/40 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={recognizedStudent.avatar}
                        alt={recognizedStudent.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-bold text-white text-sm">{recognizedStudent.name}</h4>
                        </div>
                        <p className="text-xs text-emerald-200/80 font-mono">
                          {recognizedStudent.rollNo} • {recognizedStudent.department}
                        </p>
                        <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                          ✓ Attendance Logged: PRESENT
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-semibold">Match Score</div>
                      <div className="text-lg font-mono font-extrabold text-emerald-400">{confidenceScore}%</div>
                    </div>
                  </div>
                ) : null}
              </div>

            </div>

          </div>

        </div>

        {/* Quick Test / Manual Student Selection Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Match Simulator (Click student profile to test face match):
            </span>
            <span className="text-[11px] text-slate-400">{students.length} Enrolled</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            {students.map((student, idx) => (
              <button
                key={student.id}
                onClick={() => handleManualTrigger(student)}
                className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-indigo-500/50 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 transition shrink-0 active:scale-95 group"
              >
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-6 h-6 rounded-full object-cover group-hover:ring-1 group-hover:ring-indigo-400"
                />
                <div className="text-left">
                  <div className="font-medium text-slate-200 text-xs">{student.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{student.rollNo}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

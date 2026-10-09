import React, { useState } from 'react';
import { Modal } from './Modal';
import { UserProfile } from '../types';
import { ShieldCheck, UserCheck, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdateProfile,
}) => {
  const { success } = useToast();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [name, setName] = useState(currentProfile.displayName);
  const [email, setEmail] = useState(currentProfile.email);
  const [department, setDepartment] = useState(currentProfile.department);
  const [semester, setSemester] = useState(currentProfile.semester);
  const [target, setTarget] = useState(currentProfile.targetAttendance);

  const handleApplyDemo = () => {
    onUpdateProfile({
      displayName: 'Alex Chen',
      email: 'alex.chen@campus.edu',
      studentId: 'CS-2024-042',
      department: 'Computer Science & Engineering',
      semester: '4th Semester (Year 2)',
      targetAttendance: 75,
      preferredDailyStudyHours: 4,
      isDemoMode: true,
      theme: currentProfile.theme,
    });
    success('Judge Demo Profile Activated', 'Loaded preconfigured 2nd-year engineering student profile.');
    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateProfile({
      ...currentProfile,
      displayName: name.trim(),
      email: email.trim() || 'student@campus.edu',
      department: department.trim() || 'Engineering',
      semester: semester.trim() || '4th Semester',
      targetAttendance: Number(target) || 75,
      isDemoMode: false,
    });

    success('Profile Updated', `Welcome, ${name}! Your local study profile has been saved.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Session & Profile Access"
      description="SmartCampus operates with client-side sandbox isolation. No plaintext credentials are stored."
    >
      <div className="space-y-5">
        {/* Notice on security & honest authentication */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Honest Hackathon Demonstration</p>
            <p className="mt-0.5 leading-relaxed">
              In accordance with academic integrity guidelines, we do not use pseudo-passwords or fake auth mocks.
              You can instantly use the pre-loaded <strong>Judge Demo Student</strong> or customize your own identity.
            </p>
          </div>
        </div>

        {!isCustomizing ? (
          <div className="space-y-3">
            <button
              onClick={handleApplyDemo}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50 text-indigo-950 dark:text-indigo-100 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">One-Click Judge Demo Mode</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Explore Alex Chen (Year 2 CSE) with pre-populated attendance, tasks, & notes.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsCustomizing(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Create Custom Student Profile
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enter your real name, department, semester, and personal target attendance.
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. 4th Semester"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Attendance Goal ({target}%)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>50%</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Target: {target}%</span>
                <span>95%</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
              >
                Save & Continue
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

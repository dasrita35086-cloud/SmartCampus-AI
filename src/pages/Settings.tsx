import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  ShieldCheck,
  AlertTriangle,
  User,
  Clock,
  Percent,
  CheckCircle2,
  HardDrive,
  Key,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  exportAllData,
  resetAllDataToDemo,
  validateAndImportData,
} from '../utils/storage';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onReloadAllData: () => void;
  hasApiKey: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
  profile,
  onUpdateProfile,
  onReloadAllData,
  hasApiKey,
}) => {
  const { success, error: toastError, info } = useToast();

  const [name, setName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email);
  const [department, setDepartment] = useState(profile.department);
  const [semester, setSemester] = useState(profile.semester);
  const [targetAttendance, setTargetAttendance] = useState(profile.targetAttendance);
  const [studyHours, setStudyHours] = useState(profile.preferredDailyStudyHours);

  // Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    onUpdateProfile({
      ...profile,
      displayName: name.trim() || 'Alex Chen',
      email: email.trim(),
      department: department.trim(),
      semester: semester.trim(),
      targetAttendance: Number(targetAttendance),
      preferredDailyStudyHours: Number(studyHours),
    });

    success('Preferences Saved', 'Updated local user profile and targets.');
  };

  const handleExportData = () => {
    const data = exportAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartcampus_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Backup Exported', 'Downloaded full SmartCampus JSON snapshot.');
  };

  const handleFileImportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      setIsImportModalOpen(true);
      setImportError(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importJsonText.trim()) return;

    const result = validateAndImportData(importJsonText);
    if (result.success) {
      onReloadAllData();
      setIsImportModalOpen(false);
      setImportJsonText('');
      success('Data Imported Successfully', 'Loaded attendance, timetable, tasks, and notes.');
    } else {
      setImportError(result.error || 'Failed to parse JSON file.');
      toastError('Import Validation Error', result.error);
    }
  };

  const handleConfirmReset = () => {
    resetAllDataToDemo();
    onReloadAllData();
    setIsResetConfirmOpen(false);
    info('Reset Completed', 'Restored default Year 2 engineering demo dataset.');
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings & Local Data Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize academic targets, control client-side persistence, and manage data backups
        </p>
      </div>

      {/* Persistence Architecture Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          <span>Local Storage Architecture & Privacy Notice</span>
        </div>
        <p className="leading-relaxed text-xs">
          SmartCampus stores all user attendance records, schedules, tasks, and notes directly inside your
          browser's isolated <strong>LocalStorage sandbox</strong>. Your personal data is never transmitted to
          an unencrypted third-party database. Note: LocalStorage does not automatically sync across separate
          devices or browsers; use the <strong>JSON Export/Import</strong> below to transfer data.
        </p>
      </div>

      {/* Profile and Academic Target Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Academic Profile & Preferences</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Target Attendance Goal ({targetAttendance}%)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {targetAttendance}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={targetAttendance}
                onChange={(e) => setTargetAttendance(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used to compute required consecutive classes across all subjects
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Preferred Daily Study Hours ({studyHours}h)
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {studyHours} hrs/day
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Sets upper limit for the automated study scheduler
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Theme and AI Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Theme Settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Display Theme</h4>
            <p className="text-xs text-slate-500 mt-0.5">Toggle light or dark dashboard appearance</p>
          </div>

          <button
            onClick={() =>
              onUpdateProfile({
                ...profile,
                theme: profile.theme === 'light' ? 'dark' : 'light',
              })
            }
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {profile.theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>

        {/* AI Engine Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Service Engine</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasApiKey ? 'Google Gemini 3.8 Flash (Active)' : 'Local Academic Engine (Demo Mode)'}
            </p>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              hasApiKey
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {hasApiKey ? 'Live AI Proxy' : 'Offline Safe'}
          </span>
        </div>
      </div>

      {/* JSON Backup & Reset Controls */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Data Backup & Demonstration Reset
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Export your entire state as standard JSON or restore the factory demo data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Application JSON Backup</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition">
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>Import JSON File</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileImportUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Clean Demo Dataset</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset All Data to Demo Defaults?"
        description="This will restore the preloaded 2nd-year engineering student sample data."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All custom subjects, modified attendance counts, tasks, and notes will be replaced with
            the original Hackathon demonstration benchmark data.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Review Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Verify & Import SmartCampus JSON"
        description="Inspect backup contents before applying."
      >
        <div className="space-y-4">
          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Importing this file will merge the saved dataset into your current browser sandbox.
          </p>

          <textarea
            rows={8}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full p-3 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Apply JSON Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

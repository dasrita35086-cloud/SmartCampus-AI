import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calculator,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  HelpCircle,
} from 'lucide-react';
import { AttendanceSubject } from '../types';
import {
  calculateAttendance,
  calculateOverallAttendance,
  validateAttendanceInput,
} from '../utils/attendance';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface AttendanceCalculatorProps {
  subjects: AttendanceSubject[];
  onUpdateSubjects: (subjects: AttendanceSubject[]) => void;
  defaultTargetPercentage: number;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({
  subjects,
  onUpdateSubjects,
  defaultTargetPercentage,
}) => {
  const { success, error: toastError, info } = useToast();

  // State for Add / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AttendanceSubject | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAttended, setFormAttended] = useState('');
  const [formTotal, setFormTotal] = useState('');
  const [formTarget, setFormTarget] = useState(defaultTargetPercentage.toString());
  const [formProfessor, setFormProfessor] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // State for Delete confirmation modal
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);

  // What-If Simulator Subject selection
  const [simulatorSubjectId, setSimulatorSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [simulatedExtraAttended, setSimulatedExtraAttended] = useState(0);
  const [simulatedExtraMissed, setSimulatedExtraMissed] = useState(0);

  const overall = calculateOverallAttendance(subjects);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormName('');
    setFormCode('');
    setFormAttended('');
    setFormTotal('');
    setFormTarget(defaultTargetPercentage.toString());
    setFormProfessor('');
    setFormRoom('');
    setFormValidationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: AttendanceSubject) => {
    setEditingSubject(sub);
    setFormName(sub.name);
    setFormCode(sub.code || '');
    setFormAttended(sub.attended.toString());
    setFormTotal(sub.total.toString());
    setFormTarget(sub.targetPercentage.toString());
    setFormProfessor(sub.professor || '');
    setFormRoom(sub.room || '');
    setFormValidationError(null);
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();

    const attendedNum = parseInt(formAttended);
    const totalNum = parseInt(formTotal);
    const targetNum = parseFloat(formTarget);

    const validation = validateAttendanceInput(attendedNum, totalNum, targetNum);
    if (!validation.isValid) {
      setFormValidationError(validation.error || 'Invalid input.');
      return;
    }

    if (!formName.trim()) {
      setFormValidationError('Subject name cannot be empty.');
      return;
    }

    if (editingSubject) {
      // Update existing
      const updated = subjects.map((s) =>
        s.id === editingSubject.id
          ? {
              ...s,
              name: formName.trim(),
              code: formCode.trim().toUpperCase(),
              attended: attendedNum,
              total: totalNum,
              targetPercentage: targetNum,
              professor: formProfessor.trim(),
              room: formRoom.trim(),
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : s
      );
      onUpdateSubjects(updated);
      success('Subject Updated', `Updated attendance record for ${formName}.`);
    } else {
      // Create new
      const newSub: AttendanceSubject = {
        id: `att-${Date.now()}`,
        name: formName.trim(),
        code: formCode.trim().toUpperCase() || 'SUB-101',
        attended: attendedNum,
        total: totalNum,
        targetPercentage: targetNum,
        professor: formProfessor.trim(),
        room: formRoom.trim(),
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      onUpdateSubjects([...subjects, newSub]);
      success('Subject Added', `Created new record for ${formName}.`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteSubjectId) return;
    const filtered = subjects.filter((s) => s.id !== deleteSubjectId);
    onUpdateSubjects(filtered);
    setDeleteSubjectId(null);
    info('Subject Deleted', 'Attendance record removed.');
  };

  // Quick attendance increments directly from cards
  const handleQuickMark = (id: string, attended: boolean) => {
    const updated = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          attended: attended ? s.attended + 1 : s.attended,
          total: s.total + 1,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return s;
    });
    onUpdateSubjects(updated);
    success(
      attended ? 'Marked Present (+1 Attended)' : 'Marked Absent (+1 Missed)',
      'Attendance numbers updated.'
    );
  };

  // What-If Simulator computations
  const currentSimSubject =
    subjects.find((s) => s.id === simulatorSubjectId) || subjects[0];
  const simAttended = currentSimSubject
    ? currentSimSubject.attended + simulatedExtraAttended
    : 0;
  const simTotal = currentSimSubject
    ? currentSimSubject.total + simulatedExtraAttended + simulatedExtraMissed
    : 0;
  const simCalc = currentSimSubject
    ? calculateAttendance(simAttended, simTotal, currentSimSubject.targetPercentage)
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Aggregate Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Attendance Health & Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consecutive attendance formula ensures you never fall below university minimums
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course / Subject</span>
        </button>
      </div>

      {/* Aggregate Semester Summary Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                overall.overallPercentage >= defaultTargetPercentage
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {overall.overallPercentage}%
                </span>
                <span className="text-xs text-slate-500">Overall Semester Average</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Conducted: {overall.totalConducted} classes | Total Attended:{' '}
                {overall.totalAttended} classes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>{overall.safeSubjectsCount} Safe Standing</span>
            </div>
            {overall.shortageSubjectsCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-4 h-4" />
                <span>{overall.shortageSubjectsCount} Shortage Warning</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const calc = calculateAttendance(sub.attended, sub.total, sub.targetPercentage);
          const isShortage = calc.percentage < sub.targetPercentage;

          return (
            <div
              key={sub.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-xs hover:shadow-md flex flex-col justify-between ${
                isShortage
                  ? 'border-rose-200 dark:border-rose-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {sub.code}
                      </span>
                      <span className="text-[11px] text-slate-400">Target: {sub.targetPercentage}%</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteSubjectId(sub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Percentage and Counts */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-3xl font-black ${
                        isShortage
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {calc.percentage}%
                    </span>
                    <span className="text-xs text-slate-400">
                      ({sub.attended}/{sub.total})
                    </span>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                      isShortage
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {calc.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isShortage ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, calc.percentage))}%` }}
                  />
                </div>

                {/* Mathematical Insight Pill */}
                <div
                  className={`p-2.5 rounded-xl text-xs mb-4 ${
                    isShortage
                      ? 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800/60'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60'
                  }`}
                >
                  {isShortage ? (
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          Attend next {calc.requiredToAttend} consecutive classes
                        </span>{' '}
                        (assuming zero future absences) to reach {sub.targetPercentage}%.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {calc.canBunk > 0
                            ? `You can safely miss ${calc.canBunk} classes`
                            : 'Borderline target'}
                        </span>{' '}
                        while remaining at or above {sub.targetPercentage}%.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick-Action Counters (+Present / +Absent) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Quick Log:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleQuickMark(sub.id, true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Attended</span>
                  </button>
                  <button
                    onClick={() => handleQuickMark(sub.id, false)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100 transition"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>+ Missed</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive "What-If" Simulator */}
      {currentSimSubject && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/60 dark:from-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Interactive "What-If" Attendance Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulate upcoming lecture streaks before making weekend plans or taking leave.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Simulate Course:</span>
              <select
                value={simulatorSubjectId}
                onChange={(e) => {
                  setSimulatorSubjectId(e.target.value);
                  setSimulatedExtraAttended(0);
                  setSimulatedExtraMissed(0);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Slider 1: Extra Attended */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-emerald-700 dark:text-emerald-400">
                  Attending Next Classes:
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  +{simulatedExtraAttended}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={simulatedExtraAttended}
                onChange={(e) => setSimulatedExtraAttended(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">Simulate consecutive attendance</p>
            </div>

            {/* Slider 2: Extra Missed */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-rose-700 dark:text-rose-400">Missing Next Classes:</span>
                <span className="text-rose-700 dark:text-rose-400">+{simulatedExtraMissed}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={simulatedExtraMissed}
                onChange={(e) => setSimulatedExtraMissed(parseInt(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">Simulate taking leave or bunks</p>
            </div>

            {/* Simulated Outcome Result */}
            {simCalc && (
              <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 font-semibold">Simulated Outcome</span>
                  <button
                    onClick={() => {
                      setSimulatedExtraAttended(0);
                      setSimulatedExtraMissed(0);
                    }}
                    className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-300">
                    {simCalc.percentage}%
                  </span>
                  <span className="text-xs text-slate-400">
                    ({simAttended}/{simTotal})
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {simCalc.statusLabel}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject Attendance' : 'Add Subject to Tracker'}
        description="Records are validated according to university credit requirements."
      >
        <form onSubmit={handleSaveSubject} className="space-y-4">
          {formValidationError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formValidationError}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Distributed Systems"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="CS206"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attended Classes *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formAttended}
                onChange={(e) => setFormAttended(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Conducted *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formTotal}
                onChange={(e) => setFormTotal(e.target.value)}
                placeholder="25"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target % (e.g. 75) *
              </label>
              <input
                type="number"
                min="1"
                max="99"
                required
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                placeholder="75"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty / Professor
              </label>
              <input
                type="text"
                value={formProfessor}
                onChange={(e) => setFormProfessor(e.target.value)}
                placeholder="Dr. Johnson"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hall / Lab Room
              </label>
              <input
                type="text"
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                placeholder="Hall B-102"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
            >
              {editingSubject ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteSubjectId}
        onClose={() => setDeleteSubjectId(null)}
        title="Delete Course Record"
        description="Are you sure you want to remove this subject from your attendance tracker?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This action will permanently delete this subject's historical count and calculation. You
            can add it back anytime.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteSubjectId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Delete Subject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

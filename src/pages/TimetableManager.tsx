import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  User,
  AlertTriangle,
  Calendar,
  Layers,
} from 'lucide-react';
import { DayOfWeek, TimetableSlot } from '../types';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface TimetableManagerProps {
  timetable: TimetableSlot[];
  onUpdateTimetable: (slots: TimetableSlot[]) => void;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  timetable,
  onUpdateTimetable,
}) => {
  const { success, error: toastError, info } = useToast();

  const daysOfWeek: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const currentDayIndex = new Date().getDay();
  // 0 is Sunday, 1 is Monday ...
  const defaultToday = daysOfWeek[(currentDayIndex + 6) % 7];

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(defaultToday || 'Monday');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Form states
  const [formSubject, setFormSubject] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDay, setFormDay] = useState<DayOfWeek>(selectedDay);
  const [formRoom, setFormRoom] = useState('');
  const [formProfessor, setFormProfessor] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:30');
  const [formColor, setFormColor] = useState('indigo');
  const [formError, setFormError] = useState<string | null>(null);
  const [allowOverlapConfirmation, setAllowOverlapConfirmation] = useState(false);

  // Delete modal state
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

  // Filter slots for selected day
  const daySlots = timetable
    .filter((slot) => slot.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setFormSubject('');
    setFormCode('');
    setFormDay(selectedDay);
    setFormRoom('');
    setFormProfessor('');
    setFormStartTime('09:00');
    setFormEndTime('10:30');
    setFormColor('indigo');
    setFormError(null);
    setAllowOverlapConfirmation(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormSubject(slot.subject);
    setFormCode(slot.code || '');
    setFormDay(slot.day);
    setFormRoom(slot.room);
    setFormProfessor(slot.professor || '');
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormColor(slot.color || 'indigo');
    setFormError(null);
    setAllowOverlapConfirmation(false);
    setIsModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSubject.trim() || !formRoom.trim()) {
      setFormError('Subject and Classroom / Lab room are required.');
      return;
    }

    // Validation: End time must be later than start time
    if (formStartTime >= formEndTime) {
      setFormError('End time must be strictly later than start time.');
      return;
    }

    // Overlap validation on the same day
    const existingOnSameDay = timetable.filter(
      (s) => s.day === formDay && (!editingSlot || s.id !== editingSlot.id)
    );

    const hasOverlap = existingOnSameDay.some(
      (s) =>
        (formStartTime >= s.startTime && formStartTime < s.endTime) ||
        (formEndTime > s.startTime && formEndTime <= s.endTime) ||
        (formStartTime <= s.startTime && formEndTime >= s.endTime)
    );

    if (hasOverlap && !allowOverlapConfirmation) {
      setFormError(
        'Time conflict detected: This slot overlaps with an existing class on the same day. Check the box below if this is an intentional combined lab or parallel session.'
      );
      setAllowOverlapConfirmation(true);
      return;
    }

    if (editingSlot) {
      const updated = timetable.map((s) =>
        s.id === editingSlot.id
          ? {
              ...s,
              subject: formSubject.trim(),
              code: formCode.trim().toUpperCase(),
              day: formDay,
              room: formRoom.trim(),
              professor: formProfessor.trim(),
              startTime: formStartTime,
              endTime: formEndTime,
              color: formColor,
            }
          : s
      );
      onUpdateTimetable(updated);
      success('Timetable Updated', `Updated class ${formSubject}.`);
    } else {
      const newSlot: TimetableSlot = {
        id: `time-${Date.now()}`,
        subject: formSubject.trim(),
        code: formCode.trim().toUpperCase(),
        day: formDay,
        room: formRoom.trim(),
        professor: formProfessor.trim(),
        startTime: formStartTime,
        endTime: formEndTime,
        color: formColor,
      };
      onUpdateTimetable([...timetable, newSlot]);
      success('Class Scheduled', `Added ${formSubject} to ${formDay}.`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteSlotId) return;
    const filtered = timetable.filter((s) => s.id !== deleteSlotId);
    onUpdateTimetable(filtered);
    setDeleteSlotId(null);
    info('Class Removed', 'Slot deleted from timetable.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Weekly Course Timetable & Room Locator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View daily schedule with lecture hall routing, faculty information, and overlap validation
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lecture / Lab</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {daysOfWeek.map((day) => {
          const count = timetable.filter((s) => s.day === day).length;
          const isSelected = selectedDay === day;
          const isToday = defaultToday === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  Today
                </span>
              )}
              <span
                className={`text-[10px] px-1.5 rounded-full ${
                  isSelected ? 'bg-indigo-700 text-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Timetable View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{selectedDay}'s Academic Schedule</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {daySlots.length} {daySlots.length === 1 ? 'class' : 'classes'} scheduled for this day
            </p>
          </div>
        </div>

        {daySlots.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No classes scheduled on {selectedDay}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Click "Add Lecture / Lab" to register a class for this day.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {daySlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition gap-3"
              >
                <div className="flex items-center gap-4">
                  {/* Color Accent Indicator */}
                  <div className="w-2.5 h-12 rounded-full bg-indigo-600 shrink-0" />

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {slot.subject}
                      </h4>
                      {slot.code && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {slot.code}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-3.5 h-3.5" />
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {slot.room}
                      </span>
                      {slot.professor && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {slot.professor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenEdit(slot)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Slot"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteSlotId(slot.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete Slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? 'Edit Class Slot' : 'Add Class to Timetable'}
        description="Verify classroom location and start/end timing."
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="leading-relaxed">{formError}</p>
                {allowOverlapConfirmation && (
                  <label className="flex items-center gap-2 mt-2 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowOverlapConfirmation}
                      onChange={(e) => setAllowOverlapConfirmation(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    <span>Yes, intentionally permit time overlap for this slot.</span>
                  </label>
                )}
              </div>
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
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
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
                placeholder="CS202"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Day of Week *
              </label>
              <select
                value={formDay}
                onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room / Hall / Lab *
              </label>
              <input
                type="text"
                required
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                placeholder="e.g. Hall B-204"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty / Professor
              </label>
              <input
                type="text"
                value={formProfessor}
                onChange={(e) => setFormProfessor(e.target.value)}
                placeholder="e.g. Prof. Vance"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
              {editingSlot ? 'Save Changes' : 'Schedule Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteSlotId}
        onClose={() => setDeleteSlotId(null)}
        title="Remove Timetable Slot"
        description="Are you sure you want to delete this class from your timetable?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This will permanently remove the class session from your schedule.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteSlotId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Delete Slot
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { DailyPlan, Difficulty, Priority, StudyTask, UserProfile } from '../types';
import {
  generateDeterministicSchedule,
  getDaysRemaining,
} from '../utils/scheduler';
import { requestAiPlannerOptimization } from '../services/api';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface StudyPlannerProps {
  tasks: StudyTask[];
  onUpdateTasks: (tasks: StudyTask[]) => void;
  profile: UserProfile;
  hasApiKey: boolean;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  tasks,
  onUpdateTasks,
  profile,
  hasApiKey,
}) => {
  const { success, error: toastError, info } = useToast();

  const [activeView, setActiveView] = useState<'schedule' | 'tasks'>('schedule');
  const [dailyHours, setDailyHours] = useState<number>(
    profile.preferredDailyStudyHours || 4
  );

  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // Form state
  const [formSubject, setFormSubject] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('medium');
  const [formEstimatedHours, setFormEstimatedHours] = useState('2');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // AI Optimization state
  const [isOptimizingWithAi, setIsOptimizingWithAi] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);

  // Compute deterministic schedule
  const deterministicSchedule = generateDeterministicSchedule(
    tasks,
    dailyHours,
    7,
    new Date()
  );

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormSubject('');
    setFormTopic('');
    setFormDeadline(
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setFormPriority('medium');
    setFormDifficulty('medium');
    setFormEstimatedHours('2');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: StudyTask) => {
    setEditingTask(task);
    setFormSubject(task.subject);
    setFormTopic(task.topic);
    setFormDeadline(task.deadline);
    setFormPriority(task.priority);
    setFormDifficulty(task.difficulty);
    setFormEstimatedHours(task.estimatedHours.toString());
    setFormNotes(task.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSubject.trim() || !formTopic.trim() || !formDeadline) {
      setFormError('Please fill in Subject, Topic, and Deadline.');
      return;
    }

    const hours = parseFloat(formEstimatedHours);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      setFormError('Estimated hours must be between 0.5 and 24.');
      return;
    }

    if (editingTask) {
      const updated = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              subject: formSubject.trim(),
              topic: formTopic.trim(),
              deadline: formDeadline,
              priority: formPriority,
              difficulty: formDifficulty,
              estimatedHours: hours,
              notes: formNotes.trim(),
            }
          : t
      );
      onUpdateTasks(updated);
      success('Task Updated', `Updated ${formTopic}.`);
    } else {
      const newTask: StudyTask = {
        id: `task-${Date.now()}`,
        subject: formSubject.trim(),
        topic: formTopic.trim(),
        deadline: formDeadline,
        priority: formPriority,
        difficulty: formDifficulty,
        estimatedHours: hours,
        completed: false,
        notes: formNotes.trim(),
      };
      onUpdateTasks([...tasks, newTask]);
      success('Task Created', `Added study task: ${formTopic}.`);
    }

    setIsModalOpen(false);
  };

  const handleToggleComplete = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    onUpdateTasks(updated);

    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      success('Task Completed! 🎉', `Marked "${task.topic}" as finished.`);
    } else {
      info('Task Reopened', 'Task marked incomplete.');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTaskId) return;
    const filtered = tasks.filter((t) => t.id !== deleteTaskId);
    onUpdateTasks(filtered);
    setDeleteTaskId(null);
    info('Task Removed', 'Study task deleted.');
  };

  const handleRequestAiOptimization = async () => {
    setIsOptimizingWithAi(true);
    setAiRecommendations(null);

    try {
      const pendingTasks = tasks.filter((t) => !t.completed);
      if (pendingTasks.length === 0) {
        toastError('No Incomplete Tasks', 'Please add at least one study task to optimize.');
        setIsOptimizingWithAi(false);
        return;
      }

      const res = await requestAiPlannerOptimization(
        pendingTasks,
        dailyHours,
        'Optimize study pacing before upcoming engineering exams'
      );

      if (res.success && res.data) {
        setAiRecommendations(res.data.recommendations);
        success('Schedule Optimized by Gemini AI', 'Adjusted study priorities and daily workload.');
      } else {
        toastError(
          'Using Deterministic Engine',
          res.error || 'Server Gemini API not configured. Deterministic scheduling applied.'
        );
      }
    } catch {
      toastError('Optimization Error', 'Using deterministic academic scheduling.');
    } finally {
      setIsOptimizingWithAi(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Smart Study Planner & Workload Allocator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distributes study tasks across available daily cognitive hours based on deadlines and difficulty
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRequestAiOptimization}
            disabled={isOptimizingWithAi || tasks.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold text-xs transition shadow-xs active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>{isOptimizingWithAi ? 'Optimizing...' : 'Gemini AI Optimize'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Overview Progress & Daily Hour Setting */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
              {progressPercent}%
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {completedCount} of {tasks.length} Tasks Completed
                </span>
                <span className="text-xs text-slate-400">({pendingCount} remaining)</span>
              </div>
              <div className="h-2 w-48 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Daily Capacity:
              </span>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-hidden cursor-pointer"
              >
                <option value={2} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">2 hours / day</option>
                <option value={3} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">3 hours / day</option>
                <option value={4} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">4 hours / day</option>
                <option value={5} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">5 hours / day</option>
                <option value={6} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">6 hours / day</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveView('schedule')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'schedule'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                7-Day Schedule
              </button>
              <button
                onClick={() => setActiveView('tasks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'tasks'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                All Tasks ({tasks.length})
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendations Banner if present */}
        {aiRecommendations && (
          <div className="mt-4 p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 text-xs text-violet-900 dark:text-violet-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gemini AI Scheduling Recommendation:</p>
              <p className="mt-0.5 leading-relaxed">{aiRecommendations}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeView === 'schedule' ? (
        /* Daily Schedule Timeline */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Allocated Daily Study Blocks (Next 7 Days)
            </h3>
            <span className="text-xs text-slate-400">
              Max {dailyHours}h allocated daily • Algorithm prioritizes urgency & weight
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deterministicSchedule.map((day, idx) => (
              <div
                key={day.date}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {day.dateLabel}
                      </h4>
                      <p className="text-[11px] text-slate-400">{day.date}</p>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        day.totalHours > 0
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {day.totalHours}h / {dailyHours}h
                    </span>
                  </div>

                  {day.items.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No study blocks required for this day. Free time!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {day.items.map((slot, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {slot.task.subject}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {slot.allocatedHours} hrs
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                            {slot.task.topic}
                          </p>
                          <div className="text-[10px] text-slate-400 pt-0.5">
                            {slot.focusGoal}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* All Tasks List View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active Task Repository
            </h3>
            <span className="text-xs text-slate-400">Sorted by deadline urgency</span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No study tasks added yet. Click "+ New Task" above to get organized.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const daysRemaining = getDaysRemaining(task.deadline);
                const isOverdue = daysRemaining < 0 && !task.completed;
                const isUrgent = daysRemaining >= 0 && daysRemaining <= 2 && !task.completed;

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      task.completed
                        ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Completion checkmark */}
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="text-slate-400 hover:text-indigo-600 transition shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {task.topic}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {task.subject}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>Est: {task.estimatedHours} hrs</span>
                          <span>•</span>
                          <span
                            className={`font-semibold ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400'
                                : isUrgent
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-500'
                            }`}
                          >
                            Deadline: {task.deadline} (
                            {isOverdue
                              ? `${Math.abs(daysRemaining)}d overdue`
                              : daysRemaining === 0
                              ? 'Today'
                              : `${daysRemaining}d left`}
                            )
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badges and Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTaskId(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Study Task' : 'Add New Academic Task'}
        description="Tasks will be distributed automatically into your daily calendar."
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
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
                Deadline Date *
              </label>
              <input
                type="date"
                required
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic or Task Description *
            </label>
            <input
              type="text"
              required
              value={formTopic}
              onChange={(e) => setFormTopic(e.target.value)}
              placeholder="e.g. Page Replacement LRU vs Clock Algorithm"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Est. Hours *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                required
                value={formEstimatedHours}
                onChange={(e) => setFormEstimatedHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Low</option>
                <option value="medium" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Medium</option>
                <option value="high" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as Difficulty)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Easy</option>
                <option value="medium" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Medium</option>
                <option value="hard" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Revision Notes / Goals (Optional)
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Focus on step-by-step frame diagrams"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
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
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        title="Delete Study Task"
        description="Are you sure you want to remove this task?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This task will be deleted from your study schedule.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteTaskId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

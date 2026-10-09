import React from 'react';
import {
  Percent,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  CalendarDays,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Flame,
} from 'lucide-react';
import {
  Announcement,
  AttendanceSubject,
  DayOfWeek,
  StudyTask,
  TimetableSlot,
  UserProfile,
} from '../types';
import { NavigationTab } from '../components/Sidebar';
import { calculateAttendance, calculateOverallAttendance } from '../utils/attendance';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface DashboardProps {
  profile: UserProfile;
  attendance: AttendanceSubject[];
  tasks: StudyTask[];
  timetable: TimetableSlot[];
  announcements: Announcement[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenQuickTaskModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  attendance,
  tasks,
  timetable,
  announcements,
  onNavigate,
  onOpenQuickTaskModal,
}) => {
  // Compute overall attendance
  const overall = calculateOverallAttendance(attendance);

  // Compute pending vs completed tasks
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Compute today's day of week
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayDay = days[new Date().getDay()];

  // Filter today's timetable slots and sort by startTime
  const todayClasses = timetable
    .filter((slot) => slot.day === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Upcoming deadlines (next 7-14 days)
  const upcomingDeadlines = announcements
    .filter((a) => a.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  // Weekly study workload distribution data for Recharts
  const chartData = [
    { day: 'Mon', hours: 3.5, subject: 'OS & Algorithms' },
    { day: 'Tue', hours: 2.0, subject: 'Networks' },
    { day: 'Wed', hours: 4.5, subject: 'DBMS Lab' },
    { day: 'Thu', hours: 3.0, subject: 'Software Eng' },
    { day: 'Fri', hours: 2.5, subject: 'Web Systems' },
    { day: 'Sat', hours: 5.0, subject: 'Hackathon & DSA' },
    { day: 'Sun', hours: 3.0, subject: 'Revision' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 font-semibold text-indigo-200">
              {profile.department}
            </span>
            <span className="text-xs text-indigo-200">•</span>
            <span className="text-xs text-indigo-200">{profile.semester}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {profile.displayName}!
          </h2>
          <p className="text-sm text-indigo-100/90 mt-1 max-w-xl">
            You have {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} scheduled
            for today ({todayDay}) and {pendingTasks.length} pending academic deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('assistant')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-xs hover:bg-indigo-50 transition shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Study Assistant</span>
          </button>
          <button
            onClick={onOpenQuickTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border border-indigo-400/40 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Attendance */}
        <div
          onClick={() => onNavigate('attendance')}
          className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                overall.overallPercentage >= profile.targetAttendance
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {overall.overallPercentage}%
            </span>
            <span className="text-xs text-slate-500">Target: {profile.targetAttendance}%</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {overall.overallPercentage >= profile.targetAttendance ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Safe Standing
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Shortage Alert
              </span>
            )}
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 text-[11px]">
              {overall.totalAttended}/{overall.totalConducted} classes
            </span>
          </div>
        </div>

        {/* Card 2: Today's Classes */}
        <div
          onClick={() => onNavigate('timetable')}
          className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Classes
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {todayClasses.length}
            </span>
            <span className="text-xs text-slate-500">lectures & labs</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
            {todayClasses.length > 0
              ? `Next: ${todayClasses[0].subject}`
              : 'No lectures scheduled for today'}
          </div>
        </div>

        {/* Card 3: Pending Study Tasks */}
        <div
          onClick={() => onNavigate('planner')}
          className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-slate-500">{completedTasks.length} completed</span>
          </div>
          <div className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open Study Planner</span>
          </div>
        </div>

        {/* Card 4: Study Target Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daily Study Goal
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {profile.preferredDailyStudyHours}h
            </span>
            <span className="text-xs text-slate-500">per day target</span>
          </div>
          <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>4-day active study streak 🔥</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Attendance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule & Study Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Timetable Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Today's Classes ({todayDay})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct from your weekly course timetable
                </p>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Full Week <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayClasses.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">
                  No classes scheduled for {todayDay}. Great time for project work or revision!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-10 rounded-full bg-indigo-600 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {slot.subject}
                          </h4>
                          {slot.code && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                              {slot.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {slot.room}
                          </span>
                        </div>
                      </div>
                    </div>
                    {slot.professor && (
                      <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
                        {slot.professor}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Workload Distribution (Recharts) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Weekly Study Hours Allocation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Optimal workload pacing across semester courses
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Avg: 3.4 hrs/day
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    stroke={profile.theme === 'dark' ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={profile.theme === 'dark' ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    unit="h"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: profile.theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: profile.theme === 'dark' ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      color: profile.theme === 'dark' ? '#f8fafc' : '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }}
                    itemStyle={{
                      color: profile.theme === 'dark' ? '#f8fafc' : '#0f172a',
                    }}
                    cursor={{
                      fill: profile.theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                    }}
                  />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.hours >= 4 ? '#6366f1' : '#818cf8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Status & Upcoming Deadlines */}
        <div className="space-y-6">
          {/* Subject Attendance Monitor */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Attendance Health
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live course standing vs {profile.targetAttendance}% goal
                </p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Calculator
              </button>
            </div>

            <div className="space-y-4">
              {attendance.slice(0, 5).map((sub) => {
                const calc = calculateAttendance(sub.attended, sub.total, sub.targetPercentage);
                const isShortage = calc.percentage < sub.targetPercentage;

                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {sub.name}
                      </span>
                      <span
                        className={`font-bold font-mono ${
                          isShortage
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {calc.percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isShortage ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, calc.percentage))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {sub.attended}/{sub.total} attended
                      </span>
                      {isShortage ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">
                          Need +{calc.requiredToAttend} classes
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {calc.canBunk > 0 ? `Can miss ${calc.canBunk}` : 'On track'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines & Examination Alerts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Critical Deadlines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Campus assignments & exam schedule
                </p>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      Due: {item.deadline}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 text-xs space-y-2">
            <p className="font-bold text-indigo-900 dark:text-indigo-200">
              ⚡ Quick Productivity Actions
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigate('summarizer')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-center hover:bg-indigo-50/50 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Summarize PDF</span>
              </button>
              <button
                onClick={() => onNavigate('planner')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-center hover:bg-indigo-50/50 transition flex items-center justify-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                <span>Plan Study Week</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

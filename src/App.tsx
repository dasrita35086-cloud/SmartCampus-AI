import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { WelcomeLanding } from './pages/WelcomeLanding';
import { Dashboard } from './pages/Dashboard';
import { StudyAssistant } from './pages/StudyAssistant';
import { AttendanceCalculator } from './pages/AttendanceCalculator';
import { StudyPlanner } from './pages/StudyPlanner';
import { NotesSummarizer } from './pages/NotesSummarizer';
import { TimetableManager } from './pages/TimetableManager';
import { AnnouncementsDeadlines } from './pages/AnnouncementsDeadlines';
import { Settings } from './pages/Settings';
import { AuthModal } from './components/AuthModal';
import { DemoGuideModal } from './components/DemoGuideModal';
import { Modal } from './components/Modal';

import {
  Announcement,
  AttendanceSubject,
  ChatMessage,
  NoteSummary,
  Priority,
  Difficulty,
  StudyTask,
  TimetableSlot,
  UserProfile,
} from './types';
import {
  getStoredData,
  setStoredData,
  STORAGE_KEYS,
  INITIAL_PROFILE,
  INITIAL_ATTENDANCE,
  INITIAL_TIMETABLE,
  INITIAL_TASKS,
  INITIAL_NOTES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CHAT,
} from './utils/storage';
import { checkServerHealth } from './services/api';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  // Quick Task Form States
  const [quickTaskSubject, setQuickTaskSubject] = useState('');
  const [quickTaskTopic, setQuickTaskTopic] = useState('');
  const [quickTaskDeadline, setQuickTaskDeadline] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [quickTaskPriority, setQuickTaskPriority] = useState<Priority>('medium');
  const [quickTaskHours, setQuickTaskHours] = useState('2');

  // Server health state
  const [hasApiKey, setHasApiKey] = useState(false);

  // App State backed by LocalStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    const loadedProfile = getStoredData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const dedicatedTheme = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.THEME) : null;
    const isDarkInDom = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    const finalTheme = (dedicatedTheme as 'light' | 'dark') || loadedProfile.theme || (isDarkInDom ? 'dark' : 'light');
    return { ...loadedProfile, theme: finalTheme };
  });

  const [attendance, setAttendance] = useState<AttendanceSubject[]>(() =>
    getStoredData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE)
  );

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() =>
    getStoredData(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE)
  );

  const [tasks, setTasks] = useState<StudyTask[]>(() =>
    getStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS)
  );

  const [notes, setNotes] = useState<NoteSummary[]>(() =>
    getStoredData(STORAGE_KEYS.NOTES, INITIAL_NOTES)
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getStoredData(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  );

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() =>
    getStoredData(STORAGE_KEYS.CHAT, INITIAL_CHAT)
  );

  // Check health and Gemini key availability on mount
  useEffect(() => {
    checkServerHealth().then((res) => {
      if (res) {
        setHasApiKey(res.hasApiKey);
      }
    });
  }, []);

  // Sync theme changes with DOM and dedicated theme storage
  useEffect(() => {
    const isDark = profile.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    setStoredData(STORAGE_KEYS.THEME, profile.theme);
  }, [profile.theme]);

  // Sync state mutations to LocalStorage
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setStoredData(STORAGE_KEYS.PROFILE, newProfile);
    if (newProfile.theme) {
      setStoredData(STORAGE_KEYS.THEME, newProfile.theme);
      const isDark = newProfile.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    }
  };

  const updateAttendance = (newAttendance: AttendanceSubject[]) => {
    setAttendance(newAttendance);
    setStoredData(STORAGE_KEYS.ATTENDANCE, newAttendance);
  };

  const updateTimetable = (newTimetable: TimetableSlot[]) => {
    setTimetable(newTimetable);
    setStoredData(STORAGE_KEYS.TIMETABLE, newTimetable);
  };

  const updateTasks = (newTasks: StudyTask[]) => {
    setTasks(newTasks);
    setStoredData(STORAGE_KEYS.TASKS, newTasks);
  };

  const updateNotes = (newNotes: NoteSummary[]) => {
    setNotes(newNotes);
    setStoredData(STORAGE_KEYS.NOTES, newNotes);
  };

  const updateAnnouncements = (newAnnouncements: Announcement[]) => {
    setAnnouncements(newAnnouncements);
    setStoredData(STORAGE_KEYS.ANNOUNCEMENTS, newAnnouncements);
  };

  const updateChatHistory = (newHistory: ChatMessage[]) => {
    setChatHistory(newHistory);
    setStoredData(STORAGE_KEYS.CHAT, newHistory);
  };

  const reloadAllDataFromStorage = () => {
    setProfile(getStoredData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE));
    setAttendance(getStoredData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE));
    setTimetable(getStoredData(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE));
    setTasks(getStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS));
    setNotes(getStoredData(STORAGE_KEYS.NOTES, INITIAL_NOTES));
    setAnnouncements(getStoredData(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS));
    setChatHistory(getStoredData(STORAGE_KEYS.CHAT, INITIAL_CHAT));
  };

  const toggleTheme = () => {
    const nextTheme = profile.theme === 'light' ? 'dark' : 'light';
    updateProfile({ ...profile, theme: nextTheme });
  };

  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskSubject.trim() || !quickTaskTopic.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      subject: quickTaskSubject.trim(),
      topic: quickTaskTopic.trim(),
      deadline: quickTaskDeadline,
      priority: quickTaskPriority,
      difficulty: 'medium',
      estimatedHours: parseFloat(quickTaskHours) || 2,
      completed: false,
    };

    updateTasks([...tasks, newTask]);
    setIsQuickTaskOpen(false);
    setQuickTaskTopic('');
  };

  const unreadAnnouncementsCount = announcements.filter((a) => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors">
      {/* Sidebar for Desktop & Mobile drawer */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setIsLandingPage(false);
          setCurrentTab(tab);
        }}
        profile={profile}
        unreadAnnouncementsCount={unreadAnnouncementsCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        hasApiKey={hasApiKey}
      />

      {/* Main content frame */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          profile={profile}
          onToggleTheme={toggleTheme}
          hasApiKey={hasApiKey}
          onOpenHelp={() => setIsDemoGuideOpen(true)}
          onNavigate={(tab) => {
            setIsLandingPage(false);
            setCurrentTab(tab);
          }}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {isLandingPage ? (
            <WelcomeLanding
              onStartDemo={() => setIsLandingPage(false)}
              onNavigate={(tab) => {
                setIsLandingPage(false);
                setCurrentTab(tab);
              }}
              hasApiKey={hasApiKey}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  profile={profile}
                  attendance={attendance}
                  tasks={tasks}
                  timetable={timetable}
                  announcements={announcements}
                  onNavigate={setCurrentTab}
                  onOpenQuickTaskModal={() => {
                    setQuickTaskSubject(attendance[0]?.name || 'Operating Systems');
                    setIsQuickTaskOpen(true);
                  }}
                />
              )}

              {currentTab === 'assistant' && (
                <StudyAssistant
                  chatHistory={chatHistory}
                  onUpdateChatHistory={updateChatHistory}
                  subjects={attendance}
                  hasApiKey={hasApiKey}
                />
              )}

              {currentTab === 'attendance' && (
                <AttendanceCalculator
                  subjects={attendance}
                  onUpdateSubjects={updateAttendance}
                  defaultTargetPercentage={profile.targetAttendance}
                />
              )}

              {currentTab === 'planner' && (
                <StudyPlanner
                  tasks={tasks}
                  onUpdateTasks={updateTasks}
                  profile={profile}
                  hasApiKey={hasApiKey}
                />
              )}

              {currentTab === 'summarizer' && (
                <NotesSummarizer
                  notes={notes}
                  onUpdateNotes={updateNotes}
                  hasApiKey={hasApiKey}
                />
              )}

              {currentTab === 'timetable' && (
                <TimetableManager
                  timetable={timetable}
                  onUpdateTimetable={updateTimetable}
                />
              )}

              {currentTab === 'announcements' && (
                <AnnouncementsDeadlines
                  announcements={announcements}
                  onUpdateAnnouncements={updateAnnouncements}
                />
              )}

              {currentTab === 'settings' && (
                <Settings
                  profile={profile}
                  onUpdateProfile={updateProfile}
                  onReloadAllData={reloadAllDataFromStorage}
                  hasApiKey={hasApiKey}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Quick Task Modal */}
      <Modal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        title="Quick Add Study Task"
        description="Add a task directly into your academic planner."
      >
        <form onSubmit={handleQuickTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course / Subject *
            </label>
            <input
              type="text"
              required
              value={quickTaskSubject}
              onChange={(e) => setQuickTaskSubject(e.target.value)}
              placeholder="e.g. Operating Systems"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic or Assignment Title *
            </label>
            <input
              type="text"
              required
              value={quickTaskTopic}
              onChange={(e) => setQuickTaskTopic(e.target.value)}
              placeholder="e.g. Practice B-Tree Splitting"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deadline
              </label>
              <input
                type="date"
                required
                value={quickTaskDeadline}
                onChange={(e) => setQuickTaskDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                required
                value={quickTaskHours}
                onChange={(e) => setQuickTaskHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={quickTaskPriority}
                onChange={(e) => setQuickTaskPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden"
              >
                <option value="low" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Low</option>
                <option value="medium" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Medium</option>
                <option value="high" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">High</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsQuickTaskOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentProfile={profile}
        onUpdateProfile={updateProfile}
      />

      {/* Demo Guide Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigate={(tab) => {
          setIsLandingPage(false);
          setCurrentTab(tab);
        }}
        hasApiKey={hasApiKey}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  Zap,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  profile: UserProfile;
  onToggleTheme: () => void;
  hasApiKey: boolean;
  onOpenHelp: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  profile,
  onToggleTheme,
  hasApiKey,
  onOpenHelp,
  onNavigate,
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Campus Dashboard';
      case 'assistant':
        return 'AI Study Assistant';
      case 'attendance':
        return 'Smart Attendance Calculator';
      case 'planner':
        return 'AI Study Planner';
      case 'summarizer':
        return 'Lecture Notes Summarizer';
      case 'timetable':
        return 'Weekly Timetable';
      case 'announcements':
        return 'Campus Deadlines & Notices';
      case 'settings':
        return 'Settings & Data Management';
      default:
        return 'SmartCampus AI';
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {getTabTitle(currentTab)}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {todayFormatted}
            </span>
            <span>•</span>
            <span>{profile.semester}</span>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Health Status Badge */}
        <div
          title={
            hasApiKey
              ? 'Connected to Google Gemini 3.8 Flash via secure server proxy'
              : 'Server GEMINI_API_KEY is not set. Local academic logic is active.'
          }
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            hasApiKey
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{hasApiKey ? 'Gemini 3.8 Connected' : 'Demo / Offline Engine'}</span>
        </div>

        {/* Quick Ask AI button if not on assistant page */}
        {currentTab !== 'assistant' && (
          <button
            onClick={() => onNavigate('assistant')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Ask AI</span>
          </button>
        )}

        {/* Demo Guide / Help */}
        <button
          onClick={onOpenHelp}
          title="Hackathon Demo Guide & Overview"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${profile.theme === 'light' ? 'dark' : 'light'} theme`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {profile.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

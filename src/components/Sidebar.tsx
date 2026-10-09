import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Percent,
  CalendarDays,
  FileText,
  Clock,
  Bell,
  Settings,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'assistant'
  | 'attendance'
  | 'planner'
  | 'summarizer'
  | 'timetable'
  | 'announcements'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  profile: UserProfile;
  unreadAnnouncementsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  hasApiKey: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  unreadAnnouncementsCount,
  isOpenMobile,
  onCloseMobile,
  hasApiKey,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Campus Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assistant' as NavigationTab,
      label: 'AI Study Assistant',
      icon: Sparkles,
      badge: hasApiKey ? 'Gemini 3.8' : 'Offline',
      badgeColor: hasApiKey
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    },
    {
      id: 'attendance' as NavigationTab,
      label: 'Attendance Calculator',
      icon: Percent,
      badge: null,
    },
    {
      id: 'planner' as NavigationTab,
      label: 'Smart Study Planner',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'summarizer' as NavigationTab,
      label: 'Notes & PDF Summarizer',
      icon: FileText,
      badge: null,
    },
    {
      id: 'timetable' as NavigationTab,
      label: 'Timetable Manager',
      icon: Clock,
      badge: null,
    },
    {
      id: 'announcements' as NavigationTab,
      label: 'Deadlines & Noticeboard',
      icon: Bell,
      badge: unreadAnnouncementsCount > 0 ? `${unreadAnnouncementsCount}` : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings & Data Backup',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base">
                  SmartCampus
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Intelligent Companion</p>
            </div>
          </div>
        </div>

        {/* Demo Mode Badge */}
        {profile.isDemoMode && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[11px]">Judge / Demo Mode Active</p>
              <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 leading-tight mt-0.5">
                Sample dataset loaded. Changes persist locally.
              </p>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Mini Profile */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
              {profile.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {profile.displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {profile.department}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

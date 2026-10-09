import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Percent,
  CalendarDays,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { NavigationTab } from '../components/Sidebar';

interface WelcomeLandingProps {
  onStartDemo: () => void;
  onNavigate: (tab: NavigationTab) => void;
  hasApiKey: boolean;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({
  onStartDemo,
  onNavigate,
  hasApiKey,
}) => {
  return (
    <div className="min-h-full pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 border border-indigo-800/50 shadow-2xl mb-8">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Hackathon Demonstration Edition • Year 2 Engineering Project</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            SmartCampus AI
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-200 to-indigo-100">
              Your Intelligent Campus Companion
            </span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed mb-8 max-w-2xl">
            An all-in-one academic copilot designed to eliminate attendance anxiety, streamline study
            schedules, summarize dense technical lectures, and deliver AI-driven exam mastery.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onStartDemo}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
            >
              <span>Explore Dashboard (Judge Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition-all active:scale-95 backdrop-blur-xs"
            >
              <Percent className="w-4 h-4 text-indigo-300" />
              <span>Test Attendance Calculator</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-indigo-800/60 flex flex-wrap items-center gap-6 text-xs text-indigo-200/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accurate Attendance Math Formula</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gemini 3.8 Flash Server API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% LocalStorage Persistence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mb-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Engineered Academic Modules
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real engineering student tools with production-ready business logic and edge-case protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('attendance')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Smart Attendance Calculator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Uses mathematical induction to calculate exact minimum consecutive classes to attend to
              regain safe eligibility, or how many you can safely bunk.
            </p>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
              Launch module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('assistant')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              AI Study Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Provides dual-layer pedagogical breakdowns: an intuitive simple summary followed by an
              in-depth rigorous academic explanation, practice problems, and examples.
            </p>
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 inline-flex items-center gap-1">
              Launch module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('planner')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Automated Study Planner
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Distributes assignments and exam revisions across available daily study hours based on
              priority, difficulty, and deadline proximity with AI schedule optimization.
            </p>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1">
              Launch module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigate('summarizer')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Notes & PDF Summarizer
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Upload lecture slides, technical papers, or paste raw notes. Synthesizes key concepts,
              cheat-sheet summaries, flashcards, and exam-style test questions.
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              Launch module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => onNavigate('timetable')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Timetable & Room Locator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Full weekly visual schedule with professor contact and lecture hall routing, plus time-slot
              overlap conflict validation.
            </p>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
              Launch module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Card 6 */}
          <div
            onClick={() => onNavigate('announcements')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Deadlines & Noticeboard
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Centralized hub for lab deadlines, mid-term alerts, and campus hackathons with urgency
              badges and overdue tracking.
            </p>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 inline-flex items-center gap-1">
              Launch module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* System Architecture Callout */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Full-Stack Architecture & Security
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl">
              Node.js Express backend proxy with strict payload validation protects server-side Gemini API credentials.
              Client never exposes API keys. LocalStorage handles versioned offline state.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {hasApiKey ? 'Live AI Mode' : 'Offline Knowledge Engine'}
          </span>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Configure Data
          </button>
        </div>
      </div>
    </div>
  );
};

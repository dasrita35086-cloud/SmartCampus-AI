import React from 'react';
import { Modal } from './Modal';
import {
  CheckCircle2,
  Percent,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  HardDrive,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  hasApiKey: boolean;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  hasApiKey,
}) => {
  const steps = [
    {
      step: 1,
      title: 'Explore Campus Dashboard',
      tab: 'dashboard' as NavigationTab,
      icon: Calendar,
      description:
        "Check out the semester attendance health, today's lecture schedule, workload chart, and upcoming deadlines.",
    },
    {
      step: 2,
      title: 'Test Mathematical Attendance Calculator',
      tab: 'attendance' as NavigationTab,
      icon: Percent,
      description:
        'Notice Operating Systems is at 67.86% (Shortage). See the formula calculate 8 consecutive classes needed to reach 75%. Try the interactive What-If Simulator!',
    },
    {
      step: 3,
      title: 'Inspect Weekly Timetable',
      tab: 'timetable' as NavigationTab,
      icon: Clock,
      description:
        'Switch between days (Monday to Friday). Note conflict detection when trying to schedule an overlapping class.',
    },
    {
      step: 4,
      title: 'Automated Study Planning',
      tab: 'planner' as NavigationTab,
      icon: Calendar,
      description:
        'Switch between 7-Day Schedule and All Tasks. Tasks are sorted by deadline urgency and fit within your 4h daily study limit.',
    },
    {
      step: 5,
      title: 'Synthesize Lecture Notes & PDFs',
      tab: 'summarizer' as NavigationTab,
      icon: FileText,
      description:
        'Inspect the pre-generated B-Trees note with interactive flashcards. Or paste custom notes and generate a new summary.',
    },
    {
      step: 6,
      title: 'Ask AI Study Assistant',
      tab: 'assistant' as NavigationTab,
      icon: Sparkles,
      description:
        'Ask conceptual queries. Responses show a dual-layer explanation (Simple high-level + in-depth technical analysis + practice problems).',
    },
    {
      step: 7,
      title: 'Verify Offline Persistence',
      tab: 'settings' as NavigationTab,
      icon: HardDrive,
      description:
        'Make edits to any subject, add a task, or mark an announcement read. Refresh the page (F5) and observe that changes persist via LocalStorage.',
    },
  ];

  const handleStepJump = (tab: NavigationTab) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hackathon Demonstration Guide"
      description="Step-by-step walkthrough for judges and technical evaluators"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
          <span>AI Engine Status:</span>
          <span className="font-bold">
            {hasApiKey ? '✨ Gemini 3.8 Flash Connected' : '⚡ Local Academic Engine Active'}
          </span>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                onClick={() => handleStepJump(item.tab)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/40 cursor-pointer transition group flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Go to module <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </Modal>
  );
};

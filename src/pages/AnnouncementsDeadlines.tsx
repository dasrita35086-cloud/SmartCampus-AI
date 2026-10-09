import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { Announcement, AnnouncementCategory } from '../types';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface AnnouncementsDeadlinesProps {
  announcements: Announcement[];
  onUpdateAnnouncements: (announcements: Announcement[]) => void;
}

export const AnnouncementsDeadlines: React.FC<AnnouncementsDeadlinesProps> = ({
  announcements,
  onUpdateAnnouncements,
}) => {
  const { success, error: toastError, info } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<AnnouncementCategory>('Assignment');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPriority, setFormPriority] = useState<'urgent' | 'important' | 'normal'>('important');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);

  const categories = [
    'All',
    'Exam',
    'Assignment',
    'Event',
    'Administrative',
    'Hackathon',
  ];

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Assignment');
    setFormDeadline(
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setFormPriority('important');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setFormTitle(ann.title);
    setFormDescription(ann.description);
    setFormCategory(ann.category);
    setFormDeadline(ann.deadline || '');
    setFormPriority(ann.priority);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formDescription.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    if (editingAnnouncement) {
      const updated = announcements.map((a) =>
        a.id === editingAnnouncement.id
          ? {
              ...a,
              title: formTitle.trim(),
              description: formDescription.trim(),
              category: formCategory,
              deadline: formDeadline || undefined,
              priority: formPriority,
            }
          : a
      );
      onUpdateAnnouncements(updated);
      success('Notice Updated', `Updated "${formTitle}".`);
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        deadline: formDeadline || undefined,
        priority: formPriority,
        isRead: false,
        isDemo: false, // User created
        createdAt: new Date().toISOString(),
      };
      onUpdateAnnouncements([newAnn, ...announcements]);
      success('Notice Created', `Published personal academic notice: "${formTitle}".`);
    }

    setIsModalOpen(false);
  };

  const handleToggleRead = (id: string) => {
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, isRead: !a.isRead } : a
    );
    onUpdateAnnouncements(updated);
  };

  const handleConfirmDelete = () => {
    if (!deleteAnnouncementId) return;
    const filtered = announcements.filter((a) => a.id !== deleteAnnouncementId);
    onUpdateAnnouncements(filtered);
    setDeleteAnnouncementId(null);
    info('Notice Deleted', 'Removed announcement.');
  };

  // Filter and sort announcements
  const filtered = announcements.filter(
    (a) => categoryFilter === 'All' || a.category === categoryFilter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    return sortOrder === 'asc' ? diff : -diff;
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Campus Deadlines & Academic Noticeboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of assignment submissions, mid-term examinations, and hackathons
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-xs self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Post Deadline / Notice</span>
        </button>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Noticeboard Transparency:</strong> Demo announcements are realistic simulated items for
          your evaluation. User-posted items are marked as <em>Personal Entry</em>. This interface runs locally
          without an unverified university intranet connector.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Order Toggle */}
        <button
          onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort by Deadline ({sortOrder === 'asc' ? 'Earliest first' : 'Latest first'})</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              No notices match the selected category filter.
            </p>
          </div>
        ) : (
          sorted.map((item) => {
            let isOverdue = false;
            let daysUntil = null;

            if (item.deadline) {
              const d = new Date(item.deadline);
              d.setHours(0, 0, 0, 0);
              const diffMs = d.getTime() - now.getTime();
              daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              isOverdue = daysUntil < 0;
            }

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  item.isRead
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-2 max-w-3xl">
                  {/* Category & Status Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {item.category}
                    </span>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                        item.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          : item.priority === 'important'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.priority}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      {item.isDemo ? 'Demo Simulated' : 'Personal Entry'}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h3
                      className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${
                        item.isRead ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Deadline Indicator */}
                  {item.deadline && (
                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due: {item.deadline}
                      </span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400 flex items-center gap-1'
                            : daysUntil === 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {isOverdue ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" /> Overdue ({Math.abs(daysUntil!)}d ago)
                          </>
                        ) : daysUntil === 0 ? (
                          'Due Today!'
                        ) : (
                          `${daysUntil} days remaining`
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <button
                    onClick={() => handleToggleRead(item.id)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    {item.isRead ? 'Mark Unread' : 'Mark Read'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Notice"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteAnnouncementId(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnnouncement ? 'Edit Campus Deadline' : 'Post Academic Notice / Deadline'}
        description="Notices are categorized to help you prioritize your upcoming week."
      >
        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Operating Systems Project Submission"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Provide assignment guidelines, submission requirements, or room details..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as AnnouncementCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Assignment" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Assignment</option>
                <option value="Exam" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Exam</option>
                <option value="Hackathon" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Hackathon</option>
                <option value="Event" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Event</option>
                <option value="Administrative" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) =>
                  setFormPriority(e.target.value as 'urgent' | 'important' | 'normal')
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="urgent" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Urgent</option>
                <option value="important" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Important</option>
                <option value="normal" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Normal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
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
              {editingAnnouncement ? 'Save Changes' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteAnnouncementId}
        onClose={() => setDeleteAnnouncementId(null)}
        title="Delete Notice"
        description="Are you sure you want to remove this announcement?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This notice will be removed from your campus board and dashboard.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteAnnouncementId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Delete Notice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

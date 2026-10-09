import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Layers,
  FileCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { NoteSummary } from '../types';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { requestNotesSummary } from '../services/api';
import { useToast } from '../components/Toast';

interface NotesSummarizerProps {
  notes: NoteSummary[];
  onUpdateNotes: (notes: NoteSummary[]) => void;
  hasApiKey: boolean;
}

export const NotesSummarizer: React.FC<NotesSummarizerProps> = ({
  notes,
  onUpdateNotes,
  hasApiKey,
}) => {
  const { success, error: toastError, info } = useToast();

  const [inputTitle, setInputTitle] = useState('');
  const [inputSubject, setInputSubject] = useState('Operating Systems');
  const [inputText, setInputText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active view for displaying generated notes: 'current' or an existing note from history
  const [activeNote, setActiveNote] = useState<NoteSummary | null>(notes[0] || null);

  // Flashcard flip states
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsExtractingPdf(true);
    setSelectedFileName(file.name);

    if (!inputTitle) {
      setInputTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    try {
      const result = await extractTextFromPdf(file);
      if (result.hasText && result.text) {
        setInputText(result.text);
        success(
          'PDF Text Extracted',
          `Parsed ${result.pageCount} page(s) successfully (${result.text.length} characters).`
        );
      } else {
        setErrorMessage(
          result.error ||
            'Could not extract text. The document might be scanned or non-digital.'
        );
        toastError('Extraction Notice', result.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF file.');
      toastError('PDF Read Error', err.message);
    } finally {
      setIsExtractingPdf(false);
      e.target.value = '';
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim() || inputText.trim().length < 20) {
      setErrorMessage('Please provide at least 20 characters of study notes to summarize.');
      return;
    }

    setErrorMessage(null);
    setIsSummarizing(true);

    try {
      const title = inputTitle.trim() || 'Lecture Notes Analysis';
      const subject = inputSubject.trim() || 'Computer Science';

      const res = await requestNotesSummary(inputText, title, subject);

      if (res.data) {
        const newNote: NoteSummary = {
          id: `note-${Date.now()}`,
          title,
          subject,
          source: selectedFileName ? 'pdf' : 'text',
          fileName: selectedFileName || undefined,
          originalText: inputText,
          summary: res.data.summary,
          detailedNotes: res.data.detailedNotes,
          keyConcepts: res.data.keyConcepts || [],
          keyPoints: res.data.keyPoints || [],
          practiceQuestions: res.data.practiceQuestions || [],
          flashcards: res.data.flashcards || [],
          createdAt: new Date().toISOString(),
        };

        const updated = [newNote, ...notes];
        onUpdateNotes(updated);
        setActiveNote(newNote);
        setFlippedCards({});

        if (res.isLiveAi) {
          success('Notes Synthesized by Gemini 3.8', 'Structured summary, concepts, & flashcards generated.');
        } else {
          info(
            'Synthesized using Academic Engine',
            'Offline mode active. Configure GEMINI_API_KEY for live deep synthesis.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to summarize notes.');
      toastError('Summarization Error', err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleFlipCard = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyText = (content: string, sectionKey: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
    success('Copied to clipboard');
  };

  const handleDownloadTxt = (note: NoteSummary) => {
    const fileContent = `=====================================================
${note.title} (${note.subject})
Generated: ${new Date(note.createdAt).toLocaleDateString()}
SmartCampus AI Study Synthesis
=====================================================

EXECUTIVE SUMMARY:
${note.summary}

-----------------------------------------------------
STRUCTURED REVISION NOTES:
${note.detailedNotes}

-----------------------------------------------------
KEY CONCEPTS:
${note.keyConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}

-----------------------------------------------------
CORE EXAM TAKEAWAYS:
${note.keyPoints.map((p, i) => `• ${p}`).join('\n')}

-----------------------------------------------------
PRACTICE QUESTIONS:
${note.practiceQuestions
  .map(
    (q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}\n`
  )
  .join('\n')}
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.toLowerCase().replace(/\s+/g, '_')}_summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    success('Notes Downloaded', 'Saved as text file.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Lecture Notes & PDF Summarizer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste messy class notes or upload slides to extract key concepts, flashcards, & practice exams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              hasApiKey
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {hasApiKey ? 'Gemini 3.8 Flash Engine' : 'Offline / Local Parsing'}
          </span>
        </div>
      </div>

      {/* Main Grid: Input Form vs Output Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Text Input & PDF Uploader */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Input Material</span>
            </h3>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Title & Subject */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Document Title
                </label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus (Raft / Paxos)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Subject
                </label>
                <input
                  type="text"
                  value={inputSubject}
                  onChange={(e) => setInputSubject(e.target.value)}
                  placeholder="e.g. Computer Networks"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* PDF File Upload Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload Digital PDF Slides / Paper (Max 10MB)
              </label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/40">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  disabled={isExtractingPdf}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {isExtractingPdf ? 'Extracting digital text from PDF...' : 'Click or drag PDF here'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedFileName ? `Selected: ${selectedFileName}` : 'Supports PDFs with selectable text'}
                  </p>
                </div>
              </div>
            </div>

            {/* Raw Text Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Or Paste Lecture Notes Directly
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {inputText.length} characters
                </span>
              </div>
              <textarea
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste lecture transcript, textbook excerpts, or markdown notes here..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleSummarize}
              disabled={isSummarizing || isExtractingPdf || inputText.trim().length < 20}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSummarizing ? 'Analyzing & Synthesizing...' : 'Generate Full Study Synthesis'}
              </span>
            </button>
          </div>

          {/* Historical Generated Notes Quick Selector */}
          {notes.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Recent Synthesized Notes ({notes.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {notes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setActiveNote(n);
                      setFlippedCards({});
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                      activeNote?.id === n.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Synthesized Result Viewer */}
        <div className="lg:col-span-7">
          {activeNote ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Note Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {activeNote.subject}
                    </span>
                    {activeNote.fileName && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Source: {activeNote.fileName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {activeNote.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(activeNote.summary, 'summary')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    {copiedSection === 'summary' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={() => handleDownloadTxt(activeNote)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.txt)</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Summary</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeNote.summary}
                </p>
              </div>

              {/* 2. Key Concepts Tags */}
              {activeNote.keyConcepts && activeNote.keyConcepts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    🔑 Key Concepts & Definitions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeNote.keyConcepts.map((concept, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Detailed Structured Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Detailed Structured Revision Notes</span>
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                  {activeNote.detailedNotes}
                </div>
              </div>

              {/* 4. Interactive Spaced Repetition Flashcards */}
              {activeNote.flashcards && activeNote.flashcards.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Interactive Spaced Repetition Flashcards ({activeNote.flashcards.length})</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Click card to reveal answer</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNote.flashcards.map((card, i) => {
                      const isFlipped = !!flippedCards[i];
                      return (
                        <div
                          key={i}
                          onClick={() => toggleFlipCard(i)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[110px] flex flex-col justify-between select-none shadow-xs hover:border-indigo-400 ${
                            isFlipped
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider ${
                                isFlipped ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'
                              }`}
                            >
                              {isFlipped ? 'Answer' : `Card ${i + 1} • Question`}
                            </span>
                            <p className="text-xs font-medium mt-1 leading-relaxed">
                              {isFlipped ? card.back : card.front}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] mt-2 self-end ${
                              isFlipped ? 'text-indigo-200' : 'text-slate-400'
                            }`}
                          >
                            {isFlipped ? 'Click to hide ↺' : 'Click to flip →'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Practice Exam Questions */}
              {activeNote.practiceQuestions && activeNote.practiceQuestions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Exam Practice & Self-Assessment</span>
                  </span>

                  <div className="space-y-2.5">
                    {activeNote.practiceQuestions.map((pq, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5"
                      >
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          Q{i + 1}: {pq.question}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-2 border-l-2 border-emerald-500">
                          <strong className="text-emerald-700 dark:text-emerald-400">Solution:</strong>{' '}
                          {pq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No note selected
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your lecture notes on the left and click "Generate Full Study Synthesis" to view
                the AI breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

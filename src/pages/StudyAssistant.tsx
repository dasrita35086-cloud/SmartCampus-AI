import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Copy,
  AlertCircle,
  Check,
  Zap,
  Edit3,
  Cpu,
} from 'lucide-react';
import { ChatMessage, AttendanceSubject } from '../types';
import { askAiStudyAssistant, getOfflineStudyAssistance } from '../services/api';
import { useToast } from '../components/Toast';

interface StudyAssistantProps {
  chatHistory: ChatMessage[];
  onUpdateChatHistory: (history: ChatMessage[]) => void;
  subjects: AttendanceSubject[];
  hasApiKey: boolean;
}

export const StudyAssistant: React.FC<StudyAssistantProps> = ({
  chatHistory,
  onUpdateChatHistory,
  subjects,
  hasApiKey,
}) => {
  const { success, error: toastError, info } = useToast();
  const [inputQuestion, setInputQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Operating Systems');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const [lastFailedMessageId, setLastFailedMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-flight request lock to strictly prevent duplicate submissions
  const isSubmittingRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const suggestedPrompts = [
    { label: 'Explain simply', text: 'Explain the core concept in simple terms with an intuitive analogy' },
    { label: 'Short exam notes', text: 'Prepare high-yield exam bullet points and cheat-sheet summary' },
    { label: 'Practice questions', text: 'Generate 3 exam-style practice questions with hints' },
    { label: 'Real-world example', text: 'Give a real-world software engineering application' },
    { label: 'Revision checklist', text: 'Provide a structured revision checklist for this topic' },
  ];

  /**
   * Sends user question to backend Gemini endpoint with retry & fallback.
   * Prevents duplicate clicks and preserves user question on failures.
   */
  const handleSend = async (overrideText?: string, retryMessageId?: string) => {
    const questionToSend = (overrideText || inputQuestion).trim();

    // Prevent duplicate requests and empty submissions
    if (!questionToSend || isLoading || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);

    let currentHistory = chatHistory;

    // If retrying an existing error message, replace or remove the old error card
    if (retryMessageId) {
      currentHistory = currentHistory.filter((msg) => msg.id !== retryMessageId);
      onUpdateChatHistory(currentHistory);
    } else {
      // Append user message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: questionToSend,
        subject: selectedSubject,
        timestamp: new Date().toISOString(),
      };
      currentHistory = [...currentHistory, userMsg];
      onUpdateChatHistory(currentHistory);
      // Clear input only after safely adding to conversation history
      setInputQuestion('');
    }

    setLastFailedQuestion(null);
    setLastFailedMessageId(null);

    try {
      const response = await askAiStudyAssistant(
        questionToSend,
        selectedSubject,
        'balanced',
        currentHistory
      );

      if (response.success && response.data) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: response.data.simpleExplanation,
          subject: selectedSubject,
          simpleExplanation: response.data.simpleExplanation,
          detailedExplanation: response.data.detailedExplanation,
          examples: response.data.examples,
          practiceQuestions: response.data.practiceQuestions,
          timestamp: new Date().toISOString(),
          isError: false,
          modelUsed: response.modelUsed,
          wasFallback: response.wasFallback,
        };

        onUpdateChatHistory([...currentHistory, assistantMsg]);

        if (response.wasFallback) {
          info(
            'Adaptive Model Failover Active',
            `Response served via high-availability backup model: ${response.modelUsed || 'cluster backup'}.`
          );
        }
      } else {
        // AI service returned a 503, 429, or unavailable error
        const errorId = `error-${Date.now()}`;
        const errorText =
          response.error ||
          'AI Service is temporarily unavailable due to high demand. Please retry or use the offline study engine.';

        const errorMsg: ChatMessage = {
          id: errorId,
          sender: 'assistant',
          text: errorText,
          subject: selectedSubject,
          timestamp: new Date().toISOString(),
          isError: true,
          errorMessage: errorText,
          failedPrompt: questionToSend,
        };

        onUpdateChatHistory([...currentHistory, errorMsg]);
        setLastFailedQuestion(questionToSend);
        setLastFailedMessageId(errorId);

        toastError(
          'AI Service Unavailable',
          response.error || 'The model is currently experiencing high demand. You can retry or switch to offline mode.'
        );
      }
    } catch (err: any) {
      const errorId = `error-${Date.now()}`;
      const errorText = err?.message || 'Network connection to the AI study service failed.';

      const errorMsg: ChatMessage = {
        id: errorId,
        sender: 'assistant',
        text: errorText,
        subject: selectedSubject,
        timestamp: new Date().toISOString(),
        isError: true,
        errorMessage: errorText,
        failedPrompt: questionToSend,
      };

      onUpdateChatHistory([...currentHistory, errorMsg]);
      setLastFailedQuestion(questionToSend);
      setLastFailedMessageId(errorId);

      toastError('Request Error', 'Could not reach server. You can retry or use the local academic engine.');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  /**
   * Resolves a query using the deterministic local academic engine when AI is offline
   */
  const handleUseOfflineEngine = (question: string, targetMessageId?: string) => {
    const offlineData = getOfflineStudyAssistance(question, selectedSubject);

    const offlineMsg: ChatMessage = {
      id: `offline-${Date.now()}`,
      sender: 'assistant',
      text: offlineData.simpleExplanation,
      subject: selectedSubject,
      simpleExplanation: offlineData.simpleExplanation,
      detailedExplanation: offlineData.detailedExplanation,
      examples: offlineData.examples,
      practiceQuestions: offlineData.practiceQuestions,
      timestamp: new Date().toISOString(),
      isError: false,
      isOfflineEngine: true,
    };

    let updated = chatHistory;
    if (targetMessageId) {
      updated = updated.map((m) => (m.id === targetMessageId ? offlineMsg : m));
    } else {
      updated = [...updated, offlineMsg];
    }

    onUpdateChatHistory(updated);
    setLastFailedQuestion(null);
    setLastFailedMessageId(null);
    info(
      'Offline Academic Engine',
      'Answer generated using local rule-based academic engine. (Offline mode)'
    );
  };

  const handleRestoreQuestionToInput = (q: string) => {
    setInputQuestion(q);
    success('Question Restored', 'You can edit your prompt in the input box below.');
  };

  const handleClearHistory = () => {
    onUpdateChatHistory([
      {
        id: 'chat-reset',
        sender: 'assistant',
        text: 'Conversation cleared. How can I help you study today?',
        simpleExplanation: 'Ask any academic question or pick a course subject above.',
        timestamp: new Date().toISOString(),
      },
    ]);
    setLastFailedQuestion(null);
    setLastFailedMessageId(null);
    success('Chat Cleared', 'Conversation history reset.');
  };

  const handleCopyExplanation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    success('Copied to clipboard');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] pb-2">
      {/* Subject and Action Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>AI Study Assistant</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                  hasApiKey
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                {hasApiKey ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Gemini Connected (High-Availability Cluster)</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3 h-3 text-amber-500" />
                    <span>Offline / Local Academic Engine</span>
                  </>
                )}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dual-layer conceptual breakdowns (Intuitive summary + In-depth technical reasoning)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="General Studies" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                General Academic Studies
              </option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.name} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-5">
        {chatHistory.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-1 ${
                    msg.isError
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      : msg.isOfflineEngine
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {msg.isError ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : msg.isOfflineEngine ? (
                    <Cpu className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : msg.isError
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-slate-900 dark:text-slate-100 shadow-xs w-full'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                }`}
              >
                {isUser ? (
                  <div>
                    <div className="text-[10px] text-indigo-200 mb-1 font-semibold uppercase tracking-wider">
                      {msg.subject || 'Academic Query'}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  </div>
                ) : msg.isError ? (
                  /* Error Card with Actionable Retry and Fallback */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>AI Service Notice: Temporary High Demand / 503</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/40">
                      {msg.errorMessage || msg.text}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {msg.failedPrompt && (
                        <button
                          onClick={() => handleSend(msg.failedPrompt, msg.id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry AI Request</span>
                        </button>
                      )}

                      {msg.failedPrompt && (
                        <button
                          onClick={() => handleUseOfflineEngine(msg.failedPrompt!, msg.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 transition"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Use Offline Academic Engine</span>
                        </button>
                      )}

                      {msg.failedPrompt && (
                        <button
                          onClick={() => handleRestoreQuestionToInput(msg.failedPrompt!)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Prompt</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Successful Assistant Response */
                  <div className="space-y-4">
                    {/* Model Source Badge */}
                    <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-medium">
                        {msg.isOfflineEngine ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold text-[10px] flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            <span>Offline Academic Engine (Local Logic)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold text-[10px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>
                              {msg.modelUsed ? `Verified AI (${msg.modelUsed})` : 'Gemini AI Verified'}
                            </span>
                            {msg.wasFallback && (
                              <span className="ml-1 text-[9px] text-indigo-600 dark:text-indigo-400 font-bold">
                                (Failover backup)
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          handleCopyExplanation(
                            `${msg.simpleExplanation || ''}\n\n${msg.detailedExplanation || ''}`,
                            msg.id
                          )
                        }
                        className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition"
                        title="Copy explanation"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Layer 1: Simple Explanation */}
                    {msg.simpleExplanation && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Simple Intuitive Explanation</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                          {msg.simpleExplanation}
                        </p>
                      </div>
                    )}

                    {/* Layer 2: Detailed Explanation */}
                    {msg.detailedExplanation && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                            <span>In-Depth Academic Analysis</span>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {msg.detailedExplanation}
                        </div>
                      </div>
                    )}

                    {/* Fallback plain text if structure missing */}
                    {!msg.simpleExplanation && !msg.detailedExplanation && (
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                    )}

                    {/* Examples Section */}
                    {msg.examples && msg.examples.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          💡 Real-World Examples & Applications:
                        </p>
                        <ul className="space-y-1">
                          {msg.examples.map((ex, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg"
                            >
                              <span className="text-indigo-500 font-bold shrink-0">•</span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Practice Questions */}
                    {msg.practiceQuestions && msg.practiceQuestions.length > 0 && (
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          ✍️ Self-Check Practice Questions:
                        </p>
                        <div className="space-y-1.5">
                          {msg.practiceQuestions.map((q, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                            >
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1">
                                Q{i + 1}:
                              </span>
                              <span>{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-80 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-full" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-5/6" />
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>Contacting SmartCampus AI (with auto-retry & cluster failover)...</span>
              </div>
            </div>
          </div>
        )}

        {/* Retry Banner on Error */}
        {lastFailedQuestion && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Request for <strong>"{lastFailedQuestion.slice(0, 45)}{lastFailedQuestion.length > 45 ? '...' : ''}"</strong> did not complete.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSend(lastFailedQuestion, lastFailedMessageId || undefined)}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition active:scale-95 disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => handleUseOfflineEngine(lastFailedQuestion, lastFailedMessageId || undefined)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Use Offline Engine</span>
              </button>
              <button
                onClick={() => handleRestoreQuestionToInput(lastFailedQuestion)}
                className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                title="Edit in input box"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Prompts:</span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSend(`${p.text} regarding ${selectedSubject}`)}
            className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300 transition hover:bg-indigo-50/50 disabled:opacity-40"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Question Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex items-center gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={`Ask about ${selectedSubject} (e.g., Explain LRU vs FIFO, or B-Trees)...`}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden disabled:opacity-60"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputQuestion.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold transition active:scale-95 shrink-0 shadow-xs flex items-center justify-center min-w-[36px]"
          title="Send query"
        >
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

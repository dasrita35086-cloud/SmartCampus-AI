export interface AiHealthResponse {
  status: string;
  appName: string;
  hasApiKey: boolean;
  environment: string;
}

export interface ChatResponseData {
  simpleExplanation: string;
  detailedExplanation: string;
  examples: string[];
  practiceQuestions: string[];
}

export interface SummarizeResponseData {
  summary: string;
  detailedNotes: string;
  keyConcepts: string[];
  keyPoints: string[];
  practiceQuestions: { question: string; answer: string }[];
  flashcards: { front: string; back: string }[];
}

export interface PlannerOptimizationData {
  recommendations: string;
  schedule: {
    dayOffset: number;
    dateLabel: string;
    totalHours: number;
    tasks: {
      taskId: string;
      subject: string;
      topic: string;
      allocatedHours: number;
      focusGoal: string;
    }[];
  }[];
}

export async function checkServerHealth(): Promise<AiHealthResponse | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface AskAiResult {
  success: boolean;
  data?: ChatResponseData;
  isLiveAi: boolean;
  modelUsed?: string;
  wasFallback?: boolean;
  error?: string;
  retryable?: boolean;
  status?: number;
}

export async function askAiStudyAssistant(
  question: string,
  subject: string,
  mode: string = 'balanced',
  history: any[] = []
): Promise<AskAiResult> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, subject, mode, history }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.data) {
      return {
        success: true,
        data: data.data,
        isLiveAi: true,
        modelUsed: data.model,
        wasFallback: data.wasFallback,
      };
    }

    return {
      success: false,
      isLiveAi: false,
      error:
        data.error ||
        `The AI service is temporarily unavailable (${res.status}). Please try again in a moment or use the offline study engine.`,
      retryable: data.retryable !== false,
      status: res.status,
    };
  } catch (error: any) {
    return {
      success: false,
      isLiveAi: false,
      error: error.message || 'Network connection to the AI study service failed.',
      retryable: true,
      status: 0,
    };
  }
}

export function getOfflineStudyAssistance(question: string, subject: string): ChatResponseData {
  return generateOfflineChatFallback(question, subject);
}

export async function requestNotesSummary(
  text: string,
  title: string,
  subject: string
): Promise<{ success: boolean; data: SummarizeResponseData; isLiveAi: boolean; error?: string }> {
  try {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, subject }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.data) {
      return {
        success: true,
        data: data.data,
        isLiveAi: true,
      };
    }

    // Offline deterministic fallback
    const fallback = generateOfflineSummaryFallback(text, title, subject);
    return {
      success: true,
      data: fallback,
      isLiveAi: false,
      error: data.error,
    };
  } catch (err: any) {
    const fallback = generateOfflineSummaryFallback(text, title, subject);
    return {
      success: true,
      data: fallback,
      isLiveAi: false,
      error: 'Network error contacting backend.',
    };
  }
}

export async function requestAiPlannerOptimization(
  tasks: any[],
  availableDailyHours: number,
  studentTarget: string
): Promise<{ success: boolean; data?: PlannerOptimizationData; isLiveAi: boolean; error?: string }> {
  try {
    const res = await fetch('/api/ai/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, availableDailyHours, studentTarget }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.data) {
      return {
        success: true,
        data: data.data,
        isLiveAi: true,
      };
    }

    return {
      success: false,
      isLiveAi: false,
      error: data.error || 'AI Optimization requires GEMINI_API_KEY.',
    };
  } catch {
    return {
      success: false,
      isLiveAi: false,
      error: 'Backend connection failed.',
    };
  }
}

// Fallback generators for offline/demo reliability
function generateOfflineChatFallback(question: string, subject: string): ChatResponseData {
  const qLower = question.toLowerCase();
  const sub = subject || 'Computer Science & Engineering';

  // Topic-specific knowledge hints for standard CS engineering subjects
  let topicAdvice = `Deconstruct the topic into components: state models, algorithmic steps, and boundary constraints.`;
  let examples = [
    `Typical scenario: Processing inputs under standard operating conditions.`,
    `Corner case: Evaluating edge boundaries (e.g. empty buffers, overflow limits, concurrent race conditions).`,
  ];
  let practiceQuestions = [
    `What are the asymptotic time and space complexities associated with this approach?`,
    `Under what trade-offs would an alternative design or algorithm be preferable?`,
    `How does this concept impact fault tolerance and maintainability?`,
  ];

  if (qLower.includes('sort') || qLower.includes('search') || qLower.includes('tree') || qLower.includes('graph')) {
    topicAdvice = `Analyze data organization, traversal invariants (BFS/DFS, in-order/pre-order), balance criteria (AVL/Red-Black), and asymptotic cost.`;
    examples = [
      `Balanced search trees guarantee O(log n) lookups by maintaining depth invariants during insert and delete rotations.`,
      `Graph traversals use visited hash sets or distance arrays to prevent infinite cycles in cyclic topologies.`,
    ];
    practiceQuestions = [
      `Prove why comparison-based sorting has a lower bound of Ω(n log n).`,
      `How do tree balancing rotations ensure worst-case logarithmic lookup times?`,
    ];
  } else if (qLower.includes('thread') || qLower.includes('process') || qLower.includes('deadlock') || qLower.includes('memory') || qLower.includes('page')) {
    topicAdvice = `Examine OS kernel primitives: virtual memory translation (TLB & page tables), process synchronization (mutexes, semaphores), and context-switch overhead.`;
    examples = [
      `Virtual memory: MMU translates virtual page numbers to physical frames using multi-level page tables with TLB caching.`,
      `Deadlock prevention: Eliminating circular wait by imposing a global linear acquisition ordering on all system locks.`,
    ];
    practiceQuestions = [
      `What are Coffman's four conditions for deadlock, and how does ordering locks defeat circular wait?`,
      `Explain the differences and trade-offs between paging and segmentation in modern operating systems.`,
    ];
  }

  return {
    simpleExplanation: `Here is a foundational breakdown of your query regarding "${question}". In ${sub}, mastering core abstractions, data contracts, and control flow is essential for exams and practical engineering.`,
    detailedExplanation: `[Offline Academic Engine Note: Live Gemini AI service is currently unavailable or experiencing high demand. This response was generated by SmartCampus local academic logic.]\n\nKey Concepts & Systematic Approach:\n1. Problem Formalization: Define the problem statement, required inputs, and expected post-conditions.\n2. Technical Mechanics: ${topicAdvice}\n3. Analysis & Verification: Walk through edge cases, asymptotic bounds, and invariant maintenance.`,
    examples,
    practiceQuestions,
  };
}

function generateOfflineSummaryFallback(
  text: string,
  title: string,
  subject: string
): SummarizeResponseData {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const keySentences = sentences.slice(0, 4);

  return {
    summary:
      keySentences.join('. ') +
      (keySentences.length > 0 ? '.' : 'Summary of lecture notes provided.'),
    detailedNotes: `### Core Notes on ${title || subject}\n` +
      sentences
        .slice(0, 8)
        .map((s) => `- ${s}`)
        .join('\n'),
    keyConcepts: [
      `${subject} Architecture`,
      'Core Theoretical Framework',
      'System State & Transitions',
      'Optimization & Performance Bounds',
    ],
    keyPoints: [
      'Understand the fundamental definition and problem space.',
      'Identify governing mathematical formulas and trade-offs.',
      'Pay close attention to boundary constraints and implementation nuances.',
    ],
    practiceQuestions: [
      {
        question: `Explain the primary significance of ${title || 'the discussed topic'} in modern computer systems.`,
        answer:
          'Refer to the foundational principles outlined above, focusing on efficiency and maintainability.',
      },
    ],
    flashcards: [
      {
        front: `What is the main purpose of ${title || subject}?`,
        back: keySentences[0] || 'Core foundational concept in course syllabus.',
      },
    ],
  };
}

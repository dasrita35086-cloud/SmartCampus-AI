import {
  Announcement,
  AttendanceSubject,
  ChatMessage,
  NoteSummary,
  SmartCampusDataExport,
  StudyTask,
  TimetableSlot,
  UserProfile,
} from '../types';

export const STORAGE_KEYS = {
  THEME: 'smartcampus_theme_v1',
  PROFILE: 'smartcampus_profile_v1',
  ATTENDANCE: 'smartcampus_attendance_v1',
  TIMETABLE: 'smartcampus_timetable_v1',
  TASKS: 'smartcampus_tasks_v1',
  NOTES: 'smartcampus_notes_v1',
  ANNOUNCEMENTS: 'smartcampus_announcements_v1',
  CHAT: 'smartcampus_chat_v1',
};

// Realistic initial demo seed data
export const INITIAL_PROFILE: UserProfile = {
  displayName: 'Alex Chen',
  email: 'alex.chen@campus.edu',
  studentId: 'CS-2024-042',
  department: 'Computer Science & Engineering',
  semester: '4th Semester (Year 2)',
  targetAttendance: 75,
  preferredDailyStudyHours: 4,
  isDemoMode: true,
  theme: 'light',
};

export const INITIAL_ATTENDANCE: AttendanceSubject[] = [
  {
    id: 'att-1',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    attended: 25,
    total: 28,
    targetPercentage: 75,
    professor: 'Dr. Sarah Mitchell',
    room: 'Hall B-204',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'att-2',
    code: 'CS202',
    name: 'Operating Systems',
    attended: 19,
    total: 28,
    targetPercentage: 75,
    professor: 'Prof. David Vance',
    room: 'Lab 3',
    lastUpdated: '2026-10-07',
  },
  {
    id: 'att-3',
    code: 'CS203',
    name: 'Database Management Systems',
    attended: 22,
    total: 27,
    targetPercentage: 75,
    professor: 'Dr. Ananya Rao',
    room: 'Lecture Hall 1',
    lastUpdated: '2026-10-08',
  },
  {
    id: 'att-4',
    code: 'CS204',
    name: 'Computer Networks',
    attended: 20,
    total: 26,
    targetPercentage: 75,
    professor: 'Prof. Kevin Taylor',
    room: 'Seminar Room A',
    lastUpdated: '2026-10-06',
  },
  {
    id: 'att-5',
    code: 'CS205',
    name: 'Software Engineering Principles',
    attended: 25,
    total: 29,
    targetPercentage: 75,
    professor: 'Dr. Elena Rostova',
    room: 'Auditorium C',
    lastUpdated: '2026-10-09',
  },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  {
    id: 'time-1',
    day: 'Monday',
    subject: 'Data Structures & Algorithms',
    code: 'CS201',
    professor: 'Dr. Mitchell',
    room: 'Hall B-204',
    startTime: '09:00',
    endTime: '10:30',
    color: 'indigo',
  },
  {
    id: 'time-2',
    day: 'Monday',
    subject: 'Operating Systems',
    code: 'CS202',
    professor: 'Prof. Vance',
    room: 'Lab 3',
    startTime: '11:00',
    endTime: '12:30',
    color: 'violet',
  },
  {
    id: 'time-3',
    day: 'Monday',
    subject: 'Database Systems Lab',
    code: 'CS203-L',
    professor: 'Dr. Rao',
    room: 'Computer Lab 2',
    startTime: '14:00',
    endTime: '16:00',
    color: 'blue',
  },
  {
    id: 'time-4',
    day: 'Tuesday',
    subject: 'Computer Networks',
    code: 'CS204',
    professor: 'Prof. Taylor',
    room: 'Seminar Room A',
    startTime: '10:00',
    endTime: '11:30',
    color: 'emerald',
  },
  {
    id: 'time-5',
    day: 'Tuesday',
    subject: 'Software Engineering',
    code: 'CS205',
    professor: 'Dr. Rostova',
    room: 'Auditorium C',
    startTime: '13:00',
    endTime: '14:30',
    color: 'amber',
  },
  {
    id: 'time-6',
    day: 'Wednesday',
    subject: 'Data Structures Lab',
    code: 'CS201-L',
    professor: 'Dr. Mitchell',
    room: 'Computer Lab 1',
    startTime: '09:00',
    endTime: '11:00',
    color: 'indigo',
  },
  {
    id: 'time-7',
    day: 'Wednesday',
    subject: 'Database Management Systems',
    code: 'CS203',
    professor: 'Dr. Rao',
    room: 'Lecture Hall 1',
    startTime: '11:30',
    endTime: '13:00',
    color: 'blue',
  },
  {
    id: 'time-8',
    day: 'Thursday',
    subject: 'Operating Systems',
    code: 'CS202',
    professor: 'Prof. Vance',
    room: 'Lab 3',
    startTime: '09:30',
    endTime: '11:00',
    color: 'violet',
  },
  {
    id: 'time-9',
    day: 'Thursday',
    subject: 'Computer Networks Lab',
    code: 'CS204-L',
    professor: 'Prof. Taylor',
    room: 'Networks Lab',
    startTime: '14:00',
    endTime: '16:00',
    color: 'emerald',
  },
  {
    id: 'time-10',
    day: 'Friday',
    subject: 'Software Engineering Workshop',
    code: 'CS205',
    professor: 'Dr. Rostova',
    room: 'Auditorium C',
    startTime: '10:00',
    endTime: '12:00',
    color: 'amber',
  },
];

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Page Replacement Algorithms',
    deadline: '2026-10-12',
    priority: 'high',
    difficulty: 'hard',
    estimatedHours: 3.5,
    completed: false,
    notes: 'Focus on LRU, Clock, and FIFO anomaly with step-by-step frame allocation.',
  },
  {
    id: 'task-2',
    subject: 'Database Management Systems',
    topic: 'SQL Normalization (1NF to BCNF) & Indexing',
    deadline: '2026-10-14',
    priority: 'high',
    difficulty: 'medium',
    estimatedHours: 2.5,
    completed: false,
    notes: 'Solve textbook decomposition problems and verify lossless-join property.',
  },
  {
    id: 'task-3',
    subject: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming: Knapsack & Longest Common Subsequence',
    deadline: '2026-10-16',
    priority: 'medium',
    difficulty: 'hard',
    estimatedHours: 4,
    completed: false,
    notes: 'Implement tabular solutions and state transitions.',
  },
  {
    id: 'task-4',
    subject: 'Computer Networks',
    topic: 'Subnetting & TCP Handshake Congestion Control',
    deadline: '2026-10-18',
    priority: 'medium',
    difficulty: 'medium',
    estimatedHours: 2,
    completed: true,
    completedAt: '2026-10-08',
    notes: 'Completed practice subnet calculation sheet.',
  },
  {
    id: 'task-5',
    subject: 'Software Engineering',
    topic: 'UML Sequence Diagrams & Design Patterns (Observer, Factory)',
    deadline: '2026-10-20',
    priority: 'low',
    difficulty: 'easy',
    estimatedHours: 1.5,
    completed: false,
    notes: 'Prepare diagram for semester group project report.',
  },
];

export const INITIAL_NOTES: NoteSummary[] = [
  {
    id: 'note-1',
    title: 'B-Trees and Database Indexing Fundamentals',
    subject: 'Database Management Systems',
    source: 'text',
    originalText:
      'A B-Tree is a self-balancing search tree in which every node contains multiple keys and children. It is specifically optimized for systems that read and write large blocks of memory, such as relational database storage engines (InnoDB, PostgreSQL). Unlike binary search trees, B-Trees minimize disk I/O operations by maintaining a high branching factor (fan-out). B+ Trees are an extension where all actual data records or record pointers are kept in the leaf nodes, connected via a doubly-linked list for fast sequential range queries.',
    summary:
      'B-Trees and B+ Trees are self-balancing multiway search structures designed for disk-bound storage systems. They minimize costly disk I/O through high branching factors. B+ Trees specifically store all data in linked leaf nodes, enabling efficient range scans.',
    detailedNotes:
      '### 1. Motivation for B-Trees\n- Disk I/O is 10,000x slower than RAM.\n- Multi-way tree reduces tree height to O(log_B N), where B is page block size.\n\n### 2. Properties of B-Tree (Order m)\n- Root has at least 2 children.\n- Internal nodes have at least ceil(m/2) children.\n- All leaves appear at the exact same depth level.\n\n### 3. B+ Tree Variations\n- Leaves contain all key-value entries linked together sequentially.\n- Internal nodes strictly store index routing keys, maximizing fan-out.',
    keyConcepts: [
      'Branching Factor (Fan-out)',
      'Disk I/O Optimization',
      'Balanced Multiway Search Tree',
      'B+ Tree Sequential Leaf Chain',
      'Clustered vs Secondary Index',
    ],
    keyPoints: [
      'Disk access occurs in fixed pages (typically 4KB to 16KB).',
      'High fan-out keeps height under 3-4 even for millions of records.',
      'Range scans in B+ trees run in O(k + log N) by following leaf pointers.',
      'Insertions trigger proactive node splits when capacity is exceeded.',
    ],
    practiceQuestions: [
      {
        question: 'Why are B+ Trees preferred over Binary Search Trees in disk-based DBMS?',
        answer:
          'BSTs have height O(log2 N) requiring numerous disk seeks, while B+ Trees match disk block sizes with high fan-out, reducing height to 3-4 seeks.',
      },
      {
        question: 'What is the minimum number of keys in an internal node of order m B-Tree?',
        answer: 'ceil(m/2) - 1 keys.',
      },
    ],
    flashcards: [
      {
        front: 'What makes B+ Trees superior for range queries compared to standard B-Trees?',
        back: 'Leaf nodes are chained in a doubly-linked list, allowing fast sequential traversals without re-traversing the tree.',
      },
      {
        front: 'What is the time complexity of search in a B-Tree?',
        back: 'O(log_B N) disk page operations.',
      },
    ],
    createdAt: '2026-10-07T14:30:00.000Z',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Mid-Term Examination Schedule Announced',
    description:
      'Department of Computer Science has released the mid-semester examination timetable. Mid-terms commence on October 25th. Verify your hall tickets.',
    category: 'Exam',
    deadline: '2026-10-25',
    priority: 'urgent',
    isRead: false,
    isDemo: true,
    createdAt: '2026-10-08T09:00:00.000Z',
  },
  {
    id: 'ann-2',
    title: 'Operating Systems Lab Assignment 3 Submission',
    description:
      'Submit the multi-threaded simulation and synchronization mutex lab report on the course portal before midnight.',
    category: 'Assignment',
    deadline: '2026-10-12',
    priority: 'urgent',
    isRead: false,
    isDemo: true,
    createdAt: '2026-10-07T10:15:00.000Z',
  },
  {
    id: 'ann-3',
    title: 'Annual Campus Hackathon 2026 Registrations Open',
    description:
      'Build innovative software solutions in 36 hours. Teams of 2-4 students. Cash prizes and industry mentorship awards.',
    category: 'Hackathon',
    deadline: '2026-10-20',
    priority: 'important',
    isRead: true,
    isDemo: true,
    createdAt: '2026-10-06T11:00:00.000Z',
  },
  {
    id: 'ann-4',
    title: 'DBMS Project Milestone Review - Stage 1',
    description:
      'Present ER diagrams, relational schema normalized to BCNF, and sample queries to Dr. Rao.',
    category: 'Assignment',
    deadline: '2026-10-15',
    priority: 'important',
    isRead: false,
    isDemo: true,
    createdAt: '2026-10-05T08:30:00.000Z',
  },
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'chat-welcome',
    sender: 'assistant',
    text: "Hello Alex! I'm your SmartCampus AI study companion. Ask me any conceptual question, request exam revision summaries, generate practice questions, or select a subject above to get started.",
    simpleExplanation:
      'Think of me as a dedicated study partner available 24/7 to break down tough engineering concepts and help you prep for exams.',
    detailedExplanation:
      'I can clarify complex algorithms, explain hardware architecture, debug code concepts, generate flashcards, and guide you through exam checklists with step-by-step reasoning.',
    examples: [
      'Explain Page Replacement Algorithms (FIFO vs LRU)',
      'How does Dijkstra algorithm work with an example graph?',
      'Generate 3 practice questions on SQL BCNF normalization',
    ],
    timestamp: '2026-10-09T08:00:00.000Z',
  },
];

// LocalStorage helpers with defensive error recovery
export function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[LocalStorage] Failed to parse key ${key}, falling back to initial data.`, error);
    return fallback;
  }
}

export function setStoredData<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Failed to save key ${key}:`, error);
    return false;
  }
}

// Reset all demo data to clean initial state
export function resetAllDataToDemo(): void {
  setStoredData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  setStoredData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  setStoredData(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  setStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  setStoredData(STORAGE_KEYS.NOTES, INITIAL_NOTES);
  setStoredData(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  setStoredData(STORAGE_KEYS.CHAT, INITIAL_CHAT);
}

// Export all user data as formatted JSON
export function exportAllData(): SmartCampusDataExport {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile: getStoredData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE),
    attendance: getStoredData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
    timetable: getStoredData(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE),
    tasks: getStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS),
    notes: getStoredData(STORAGE_KEYS.NOTES, INITIAL_NOTES),
    announcements: getStoredData(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),
  };
}

// Validate and import JSON file
export function validateAndImportData(
  jsonString: string
): { success: boolean; error?: string; count?: number } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Uploaded file is not a valid JSON object.' };
    }

    if (!Array.isArray(parsed.attendance) && !Array.isArray(parsed.tasks)) {
      return {
        success: false,
        error: 'Invalid SmartCampus backup format. Missing required attendance or task arrays.',
      };
    }

    if (parsed.profile) setStoredData(STORAGE_KEYS.PROFILE, parsed.profile);
    if (Array.isArray(parsed.attendance)) setStoredData(STORAGE_KEYS.ATTENDANCE, parsed.attendance);
    if (Array.isArray(parsed.timetable)) setStoredData(STORAGE_KEYS.TIMETABLE, parsed.timetable);
    if (Array.isArray(parsed.tasks)) setStoredData(STORAGE_KEYS.TASKS, parsed.tasks);
    if (Array.isArray(parsed.notes)) setStoredData(STORAGE_KEYS.NOTES, parsed.notes);
    if (Array.isArray(parsed.announcements))
      setStoredData(STORAGE_KEYS.ANNOUNCEMENTS, parsed.announcements);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `JSON parsing error: ${err.message}` };
  }
}

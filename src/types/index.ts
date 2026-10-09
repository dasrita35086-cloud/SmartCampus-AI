export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type AttendanceStatus = 'safe' | 'warning' | 'shortage';

export interface AttendanceSubject {
  id: string;
  code: string;
  name: string;
  attended: number;
  total: number;
  targetPercentage: number;
  professor?: string;
  room?: string;
  lastUpdated: string;
}

export interface AttendanceCalculation {
  percentage: number;
  target: number;
  status: AttendanceStatus;
  requiredToAttend: number;
  canBunk: number;
  statusLabel: string;
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  subject: string;
  code?: string;
  professor?: string;
  room: string;
  startTime: string; // '09:00'
  endTime: string;   // '10:00'
  color: string;     // Tailwind color theme or hex
}

export type Priority = 'low' | 'medium' | 'high';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  deadline: string; // YYYY-MM-DD
  priority: Priority;
  difficulty: Difficulty;
  estimatedHours: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  scheduledDate?: string; // YYYY-MM-DD
}

export interface DailyScheduleSlot {
  task: StudyTask;
  allocatedHours: number;
  focusGoal: string;
}

export interface DailyPlan {
  date: string;
  dateLabel: string;
  totalHours: number;
  items: DailyScheduleSlot[];
}

export interface NoteSummary {
  id: string;
  title: string;
  subject: string;
  source: 'text' | 'pdf';
  fileName?: string;
  originalText: string;
  summary: string;
  detailedNotes: string;
  keyConcepts: string[];
  keyPoints: string[];
  practiceQuestions: { question: string; answer: string }[];
  flashcards: { front: string; back: string }[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  subject?: string;
  simpleExplanation?: string;
  detailedExplanation?: string;
  examples?: string[];
  practiceQuestions?: string[];
  timestamp: string;
  isError?: boolean;
  errorMessage?: string;
  isOfflineEngine?: boolean;
  modelUsed?: string;
  wasFallback?: boolean;
  failedPrompt?: string;
}

export type AnnouncementCategory =
  | 'Exam'
  | 'Assignment'
  | 'Event'
  | 'Administrative'
  | 'Hackathon';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  deadline?: string; // ISO / YYYY-MM-DD
  priority: 'urgent' | 'important' | 'normal';
  isRead: boolean;
  isDemo: boolean;
  createdAt: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  studentId: string;
  department: string;
  semester: string;
  targetAttendance: number;
  preferredDailyStudyHours: number;
  isDemoMode: boolean;
  theme: 'light' | 'dark';
}

export interface SmartCampusDataExport {
  version: string;
  exportedAt: string;
  profile: UserProfile;
  attendance: AttendanceSubject[];
  timetable: TimetableSlot[];
  tasks: StudyTask[];
  notes: NoteSummary[];
  announcements: Announcement[];
}

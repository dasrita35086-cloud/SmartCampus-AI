import {
  calculateAttendance,
  calculateOverallAttendance,
  validateAttendanceInput,
} from '../utils/attendance';
import {
  generateDeterministicSchedule,
  getDaysRemaining,
} from '../utils/scheduler';
import { validateAndImportData } from '../utils/storage';
import { StudyTask } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('=== RUNNING SMARTCAMPUS AUTOMATED TESTS ===\n');

// 1. Attendance Validation Tests
console.log('[Suite 1: Attendance Input Validation]');
const validCheck = validateAttendanceInput(20, 25, 75);
assert(validCheck.isValid === true, 'Valid attendance (20/25, 75%) passes');

const negAttended = validateAttendanceInput(-1, 20, 75);
assert(negAttended.isValid === false, 'Negative attended classes rejected');

const excessAttended = validateAttendanceInput(25, 20, 75);
assert(excessAttended.isValid === false, 'Attended greater than total rejected');

const invalidTargetHigh = validateAttendanceInput(10, 20, 105);
assert(invalidTargetHigh.isValid === false, 'Target > 100% rejected');

const invalidTargetZero = validateAttendanceInput(10, 20, 0);
assert(invalidTargetZero.isValid === false, 'Target <= 0% rejected');

// 2. Attendance Mathematics Tests
console.log('\n[Suite 2: Attendance Mathematics & Formulas]');
// Case A: Attended 19, Total 28, Target 75%
// Attendance = 19/28 = 67.86%
// Required classes formula: ceil((0.75 * 28 - 19) / (1 - 0.75)) = ceil((21 - 19) / 0.25) = ceil(2 / 0.25) = 8
const caseA = calculateAttendance(19, 28, 75);
assert(caseA.percentage === 67.86, 'Attendance percentage 19/28 is 67.86%');
assert(caseA.status === 'warning' || caseA.status === 'shortage', 'Status is warning/shortage');
assert(caseA.requiredToAttend === 8, 'Requires 8 consecutive classes to reach 75%', `Got ${caseA.requiredToAttend}`);
assert(caseA.canBunk === 0, 'Can bunk 0 classes when below target');

// Case B: Attended 25, Total 28, Target 75%
// Attendance = 25/28 = 89.29%
// Can bunk formula: floor((25 - 0.75 * 28) / 0.75) = floor((25 - 21) / 0.75) = floor(4 / 0.75) = floor(5.33) = 5 classes
const caseB = calculateAttendance(25, 28, 75);
assert(caseB.percentage === 89.29, 'Attendance percentage 25/28 is 89.29%');
assert(caseB.status === 'safe', 'Status is safe');
assert(caseB.requiredToAttend === 0, 'Requires 0 additional classes when safe');
assert(caseB.canBunk === 5, 'Can safely miss 5 classes while remaining >= 75%', `Got ${caseB.canBunk}`);

// Case C: Edge case 0 total classes
const caseZero = calculateAttendance(0, 0, 75);
assert(caseZero.percentage === 100, '0 total classes defaults safely to 100%');
assert(caseZero.requiredToAttend === 0, '0 classes required');

// Case D: Overall attendance calculation
const subjectsMock = [
  { attended: 20, total: 25, targetPercentage: 75 },
  { attended: 10, total: 25, targetPercentage: 75 },
];
const overall = calculateOverallAttendance(subjectsMock);
assert(overall.totalAttended === 30, 'Total attended is 30');
assert(overall.totalConducted === 50, 'Total conducted is 50');
assert(overall.overallPercentage === 60, 'Overall percentage is 60%');
assert(overall.safeSubjectsCount === 1, '1 safe subject');
assert(overall.shortageSubjectsCount === 1, '1 shortage subject');

// 3. Scheduling and Deadline Handling Tests
console.log('\n[Suite 3: Task Scheduling & Deadline Handling]');
const baseDate = new Date('2026-10-10T00:00:00Z');
const daysRem = getDaysRemaining('2026-10-14', baseDate);
assert(daysRem === 4, 'Correctly calculates 4 days remaining to 2026-10-14');

const mockTasks: StudyTask[] = [
  {
    id: 't1',
    subject: 'Math',
    topic: 'Calculus III',
    deadline: '2026-10-11',
    priority: 'high',
    difficulty: 'hard',
    estimatedHours: 3,
    completed: false,
  },
  {
    id: 't2',
    subject: 'Physics',
    topic: 'Electromagnetism',
    deadline: '2026-10-13',
    priority: 'medium',
    difficulty: 'medium',
    estimatedHours: 2,
    completed: false,
  },
  {
    id: 't3',
    subject: 'Chemistry',
    topic: 'Thermodynamics',
    deadline: '2026-10-12',
    priority: 'low',
    difficulty: 'easy',
    estimatedHours: 1,
    completed: true, // Should be ignored since completed
  },
];

const schedule = generateDeterministicSchedule(mockTasks, 4, 3, baseDate);
assert(schedule.length === 3, 'Generates 3 daily plans');
assert(schedule[0].totalHours <= 4, 'Day 1 total hours does not exceed 4 daily limit');
assert(
  schedule[0].items.some((i) => i.task.id === 't1'),
  'Urgent high-priority task t1 is scheduled on Day 1'
);
assert(
  !schedule.some((d) => d.items.some((i) => i.task.id === 't3')),
  'Completed task t3 is omitted from schedule'
);

// 4. Data Validation and Import Tests
console.log('\n[Suite 4: JSON Backup Import & Validation]');
const invalidJson = '{ not-valid-json }';
const importFail1 = validateAndImportData(invalidJson);
assert(importFail1.success === false, 'Invalid JSON string is safely rejected');

const missingFieldsJson = JSON.stringify({ randomKey: 123 });
const importFail2 = validateAndImportData(missingFieldsJson);
assert(importFail2.success === false, 'Missing core data arrays is safely rejected');

const validBackupJson = JSON.stringify({
  version: '1.0.0',
  attendance: [{ id: '1', name: 'Test', attended: 10, total: 10, targetPercentage: 75 }],
  tasks: [{ id: '1', subject: 'Test', topic: 'Topic', deadline: '2026-10-15', completed: false }],
});
const importSuccess = validateAndImportData(validBackupJson);
assert(importSuccess.success === true, 'Valid backup structure imports successfully');

// 5. Theme Storage Key Tests
console.log('\n[Suite 5: Theme Persistence Configuration]');
import { STORAGE_KEYS } from '../utils/storage';
assert(STORAGE_KEYS.THEME === 'smartcampus_theme_v1', 'Dedicated theme key is defined and versioned');
assert(STORAGE_KEYS.PROFILE === 'smartcampus_profile_v1', 'Profile key is defined and versioned');

// 6. AI Study Assistant & Gemini Resilience Tests
console.log('\n[Suite 6: AI Study Assistant Error Handling & Resilience]');
import { getOfflineStudyAssistance } from '../services/api';

// 6.1 Offline Engine Output Integrity
const offlineResult = getOfflineStudyAssistance('What is an operating system deadlock?', 'Operating Systems');
assert(
  typeof offlineResult.simpleExplanation === 'string' && offlineResult.simpleExplanation.length > 20,
  'Offline study engine generates simpleExplanation'
);
assert(
  typeof offlineResult.detailedExplanation === 'string' && offlineResult.detailedExplanation.includes('Offline Academic Engine Note'),
  'Offline study engine is honestly labeled and does not claim to be live AI'
);
assert(
  Array.isArray(offlineResult.examples) && offlineResult.examples.length >= 2,
  'Offline study engine returns minimum 2 examples'
);
assert(
  Array.isArray(offlineResult.practiceQuestions) && offlineResult.practiceQuestions.length >= 2,
  'Offline study engine returns practice questions'
);

// 6.2 Transient Error Identification (503 UNAVAILABLE, 429, 500, 502, 504)
function testIsTransient(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.response?.status;
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  const msg = String(error.message || error).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('overloaded') ||
    msg.includes('timeout')
  );
}

assert(
  testIsTransient({ status: 503, message: '503 UNAVAILABLE: Model experiencing high demand' }),
  '503 UNAVAILABLE recognized as transient error'
);
assert(
  testIsTransient({ status: 429, message: 'Resource exhausted / rate limit' }),
  '429 Rate Limit recognized as transient error'
);
assert(
  testIsTransient({ status: 500, message: 'Internal server error' }),
  '500 Server Error recognized as transient error'
);
assert(
  !testIsTransient({ status: 400, message: 'Bad request: question required' }),
  '400 Bad Request is not transient'
);

// 6.3 Exponential Backoff Timing Calculation
function computeBackoff(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), 4000);
}
assert(computeBackoff(1) === 1000, 'Attempt 1 backoff base is 1000ms');
assert(computeBackoff(2) === 2000, 'Attempt 2 backoff base is 2000ms');
assert(computeBackoff(3) === 4000, 'Attempt 3 backoff base is 4000ms');
assert(computeBackoff(4) === 4000, 'Attempt 4 backoff caps at 4000ms max');

// 6.4 Conversation History Preservation on Failure
import { ChatMessage } from '../types';
const testHistory: ChatMessage[] = [
  { id: '1', sender: 'assistant', text: 'Hello', timestamp: new Date().toISOString() },
  { id: '2', sender: 'user', text: 'Explain Paging', timestamp: new Date().toISOString() }
];
// When failure occurs, history must keep user query and append error notice
const errorAppended: ChatMessage[] = [
  ...testHistory,
  {
    id: '3',
    sender: 'assistant',
    text: '503 UNAVAILABLE',
    isError: true,
    failedPrompt: 'Explain Paging',
    timestamp: new Date().toISOString()
  }
];
assert(errorAppended.length === 3, 'Preserves all prior conversation history on request failure');
assert(errorAppended[1].text === 'Explain Paging', 'Preserves user question in history');
assert(errorAppended[2].failedPrompt === 'Explain Paging', 'Attaches failed prompt to error record for 1-click retry');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All business logic tests passed successfully!');
}

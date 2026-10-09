import { AttendanceCalculation, AttendanceStatus } from '../types';

export interface AttendanceValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates attendance input numbers according to academic rules
 */
export function validateAttendanceInput(
  attended: number,
  total: number,
  targetPercentage: number
): AttendanceValidationResult {
  if (isNaN(attended) || isNaN(total) || isNaN(targetPercentage)) {
    return { isValid: false, error: 'All values must be valid numbers.' };
  }

  if (attended < 0) {
    return { isValid: false, error: 'Classes attended cannot be negative.' };
  }

  if (total < 0) {
    return { isValid: false, error: 'Total classes cannot be negative.' };
  }

  if (attended > total) {
    return {
      isValid: false,
      error: 'Classes attended cannot exceed total classes conducted.',
    };
  }

  if (targetPercentage <= 0 || targetPercentage >= 100) {
    return {
      isValid: false,
      error: 'Target attendance must be strictly greater than 0% and less than 100%.',
    };
  }

  return { isValid: true };
}

/**
 * Calculates attendance metrics, status, classes needed, and bunks available
 */
export function calculateAttendance(
  attended: number,
  total: number,
  targetPercentage: number = 75
): AttendanceCalculation {
  // Edge case: if no classes held yet
  if (total === 0) {
    return {
      percentage: 100,
      target: targetPercentage,
      status: 'safe',
      requiredToAttend: 0,
      canBunk: 0,
      statusLabel: 'No classes conducted yet (100% default)',
    };
  }

  // Raw percentage rounded to 2 decimal places
  const rawPercentage = (attended / total) * 100;
  const percentage = Math.round(rawPercentage * 100) / 100;

  // Decimal target P
  const P = targetPercentage / 100;

  let status: AttendanceStatus = 'safe';
  let requiredToAttend = 0;
  let canBunk = 0;
  let statusLabel = '';

  if (percentage < targetPercentage) {
    // Formula: max(0, ceil((P * T - A) / (1 - P)))
    const needed = Math.ceil((P * total - attended) / (1 - P));
    requiredToAttend = Math.max(0, needed);

    if (percentage < targetPercentage - 10) {
      status = 'shortage';
      statusLabel = `Critical Shortage: Attend next ${requiredToAttend} consecutive classes to reach ${targetPercentage}%`;
    } else {
      status = 'warning';
      statusLabel = `Warning: Attend next ${requiredToAttend} consecutive classes to reach ${targetPercentage}%`;
    }
  } else {
    // If student is at or above target, calculate how many consecutive classes can be safely missed
    // (A / (T + M)) >= P => M <= (A - P * T) / P
    if (P > 0) {
      const allowedMisses = Math.floor((attended - P * total) / P);
      canBunk = Math.max(0, allowedMisses);
    }

    status = 'safe';
    if (canBunk > 0) {
      statusLabel = `Safe: You can miss up to ${canBunk} classes without falling below ${targetPercentage}%`;
    } else {
      statusLabel = `On Track: Right at the target line! Do not miss the next class.`;
    }
  }

  return {
    percentage,
    target: targetPercentage,
    status,
    requiredToAttend,
    canBunk,
    statusLabel,
  };
}

/**
 * Calculates aggregate stats across all subjects
 */
export function calculateOverallAttendance(
  subjects: { attended: number; total: number; targetPercentage: number }[]
) {
  if (subjects.length === 0) {
    return {
      totalAttended: 0,
      totalConducted: 0,
      overallPercentage: 0,
      safeSubjectsCount: 0,
      warningSubjectsCount: 0,
      shortageSubjectsCount: 0,
    };
  }

  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage =
    totalConducted > 0
      ? Math.round(((totalAttended / totalConducted) * 100) * 100) / 100
      : 100;

  let safeCount = 0;
  let warningCount = 0;
  let shortageCount = 0;

  for (const s of subjects) {
    const calc = calculateAttendance(s.attended, s.total, s.targetPercentage);
    if (calc.status === 'safe') safeCount++;
    else if (calc.status === 'warning') warningCount++;
    else shortageCount++;
  }

  return {
    totalAttended,
    totalConducted,
    overallPercentage,
    safeSubjectsCount: safeCount,
    warningSubjectsCount: warningCount,
    shortageSubjectsCount: shortageCount,
  };
}

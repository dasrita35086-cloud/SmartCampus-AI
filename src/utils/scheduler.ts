import { DailyPlan, DailyScheduleSlot, StudyTask } from '../types';

/**
 * Calculates priority weight for sorting
 */
function getPriorityWeight(priority: StudyTask['priority']): number {
  switch (priority) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 1;
  }
}

/**
 * Calculates days remaining until a deadline from a reference date
 */
export function getDaysRemaining(
  deadlineStr: string,
  referenceDate: Date = new Date()
): number {
  if (!deadlineStr) return 999;
  const deadline = new Date(deadlineStr);
  const now = new Date(referenceDate);
  // Reset hours to compare calendar days
  deadline.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Deterministic scheduling algorithm distributing tasks across available days
 */
export function generateDeterministicSchedule(
  tasks: StudyTask[],
  availableDailyHours: number = 4,
  daysCount: number = 7,
  startDate: Date = new Date()
): DailyPlan[] {
  // Filter active, incomplete tasks
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Sort tasks by:
  // 1. Days until deadline ascending
  // 2. Priority descending (high first)
  // 3. Estimated hours descending
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const daysA = getDaysRemaining(a.deadline, startDate);
    const daysB = getDaysRemaining(b.deadline, startDate);

    if (daysA !== daysB) {
      return daysA - daysB;
    }

    const prioDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    if (prioDiff !== 0) return prioDiff;

    return b.estimatedHours - a.estimatedHours;
  });

  // Track remaining hours needed per task
  const taskHoursRemaining = new Map<string, number>();
  for (const t of sortedTasks) {
    taskHoursRemaining.set(t.id, t.estimatedHours || 1);
  }

  const dailyPlans: DailyPlan[] = [];

  for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];

    let dateLabel = '';
    if (dayOffset === 0) dateLabel = 'Today';
    else if (dayOffset === 1) dateLabel = 'Tomorrow';
    else {
      dateLabel = currentDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    let capacityLeft = availableDailyHours;
    const dailyItems: DailyScheduleSlot[] = [];

    // Fill the day from available tasks
    for (const task of sortedTasks) {
      const remaining = taskHoursRemaining.get(task.id) || 0;
      if (remaining <= 0) continue;

      const daysUntilTaskDeadline = getDaysRemaining(task.deadline, currentDate);
      // If task is not already overdue, don't schedule far after deadline
      if (daysUntilTaskDeadline < -3) continue;

      // Allocate chunk: up to 2 hours per study block or whatever is left in capacity
      const chunk = Math.min(capacityLeft, remaining, 2);
      if (chunk > 0) {
        dailyItems.push({
          task,
          allocatedHours: Math.round(chunk * 10) / 10,
          focusGoal: `Review ${task.topic} (${task.subject}) - Part ${
            Math.round(((task.estimatedHours - remaining + chunk) / task.estimatedHours) * 100)
          }%`,
        });

        capacityLeft -= chunk;
        taskHoursRemaining.set(task.id, remaining - chunk);
      }

      if (capacityLeft <= 0.25) break; // Day capacity reached
    }

    const totalHoursAllocated = Math.round((availableDailyHours - capacityLeft) * 10) / 10;

    dailyPlans.push({
      date: dateStr,
      dateLabel,
      totalHours: totalHoursAllocated,
      items: dailyItems,
    });
  }

  return dailyPlans;
}

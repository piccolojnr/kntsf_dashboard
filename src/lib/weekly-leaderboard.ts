export function getCurrentWeekEnd(date?: Date): Date {
  const weekStart = getCurrentWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}
export function getCurrentWeekStart(date?: Date): Date {
  const now = date || new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
export function getTimeUntilReset(): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const nextMonday = new Date(getCurrentWeekStart());
  nextMonday.setDate(nextMonday.getDate() + 7);

  const timeDiff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}
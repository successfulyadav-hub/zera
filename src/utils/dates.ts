import { format, isToday, isTomorrow, isYesterday, parseISO, startOfDay, addDays, subDays } from 'date-fns';

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function friendlyDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMM d');
}

export function friendlyDateShort(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function getToday(): Date {
  return startOfDay(new Date());
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

export function getPrevDay(date: Date): Date {
  return subDays(date, 1);
}

export function getDayOfWeek(date: Date): string {
  return format(date, 'EEEE');
}

export function getMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

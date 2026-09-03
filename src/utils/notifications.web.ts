import { useState } from 'react';

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleReminderNotification(
  _reminderId: string,
  _title: string,
  _body: string | null,
  _date: string,
  _time: string,
): Promise<string | null> {
  return null;
}

export async function scheduleTaskNotification(
  _taskId: string,
  _title: string,
  _date: string,
  _dueTime: string,
): Promise<string | null> {
  return null;
}

export function useNotificationResponse() {
  const [value] = useState(null);
  return value;
}

export async function cancelNotification(_notificationId: string): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

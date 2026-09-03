import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';
const isUnsupported = isExpoGo || Platform.OS === 'web';

if (!isUnsupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isUnsupported) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleReminderNotification(
  reminderId: string,
  title: string,
  body: string | null,
  date: string,
  time: string,
): Promise<string | null> {
  if (isUnsupported) return null;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    const triggerDate = new Date(year, month - 1, day, hour, minute);
    if (triggerDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: body || undefined,
        data: { reminderId, type: 'reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export async function scheduleTaskNotification(
  taskId: string,
  title: string,
  date: string,
  dueTime: string,
): Promise<string | null> {
  if (isUnsupported) return null;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = dueTime.split(':').map(Number);

    const triggerDate = new Date(year, month - 1, day, hour, minute);
    if (triggerDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Due',
        body: title,
        data: { taskId, type: 'task', date },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export function useNotificationResponse() {
  const response = Notifications.useLastNotificationResponse();
  if (isUnsupported) return null;
  return response;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  if (isUnsupported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

export async function cancelAllNotifications(): Promise<void> {
  if (isUnsupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

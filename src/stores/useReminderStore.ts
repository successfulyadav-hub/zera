import { create } from 'zustand';
import { remindersQuery, type Reminder } from '../database/queries/reminders';

interface ReminderStore {
  reminders: Reminder[];
  upcoming: Reminder[];
  loadReminders: (date: string) => Promise<void>;
  loadUpcoming: (fromDate: string) => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, data: Partial<Omit<Reminder, 'id'>>, date: string) => Promise<void>;
  deleteReminder: (id: string, date: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean, date: string) => Promise<void>;
}

export const useReminderStore = create<ReminderStore>((set) => ({
  reminders: [],
  upcoming: [],
  loadReminders: async (date) => {
    const data = await remindersQuery.getByDate(date);
    set({ reminders: data });
  },
  loadUpcoming: async (fromDate) => {
    const data = await remindersQuery.getUpcoming(fromDate);
    set({ upcoming: data });
  },
  addReminder: async (reminder) => {
    await remindersQuery.create(reminder);
    const data = await remindersQuery.getByDate(reminder.date);
    set({ reminders: data });
  },
  updateReminder: async (id, data, date) => {
    await remindersQuery.update(id, data);
    const reminders = await remindersQuery.getByDate(date);
    set({ reminders });
  },
  deleteReminder: async (id, date) => {
    await remindersQuery.delete(id);
    const reminders = await remindersQuery.getByDate(date);
    set({ reminders });
  },
  toggleActive: async (id, isActive, date) => {
    await remindersQuery.toggleActive(id, isActive);
    const reminders = await remindersQuery.getByDate(date);
    set({ reminders });
  },
}));

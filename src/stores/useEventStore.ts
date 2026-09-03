import { create } from 'zustand';
import { eventsQuery, type Event } from '../database/queries/events';

interface EventStore {
  events: Event[];
  loadEvents: (date: string) => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, data: Partial<Omit<Event, 'id'>>, date: string) => Promise<void>;
  deleteEvent: (id: string, date: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  loadEvents: async (date) => {
    const data = await eventsQuery.getByDate(date);
    set({ events: data });
  },
  addEvent: async (event) => {
    await eventsQuery.create(event);
    const data = await eventsQuery.getByDate(event.date);
    set({ events: data });
  },
  updateEvent: async (id, data, date) => {
    await eventsQuery.update(id, data);
    const events = await eventsQuery.getByDate(date);
    set({ events });
  },
  deleteEvent: async (id, date) => {
    await eventsQuery.delete(id);
    const events = await eventsQuery.getByDate(date);
    set({ events });
  },
}));

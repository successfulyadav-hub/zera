import { create } from 'zustand';
import { notesQuery, type Note } from '../database/queries/notes';

interface NoteStore {
  notes: Note[];
  allNotes: Note[];
  loadNotes: (date: string) => Promise<void>;
  loadAllNotes: () => Promise<void>;
  saveNote: (date: string, content: string, title?: string | null, pageNumber?: number) => Promise<string>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  allNotes: [],
  loadNotes: async (date) => {
    try {
      const data = await notesQuery.getByDate(date);
      set({ notes: data });
    } catch (e) {
      console.warn('Failed to load notes:', e);
    }
  },
  loadAllNotes: async () => {
    try {
      const data = await notesQuery.getAll();
      set({ allNotes: data });
    } catch (e) {
      console.warn('Failed to load all notes:', e);
    }
  },
  saveNote: async (date, content, title, pageNumber = 1) => {
    const id = await notesQuery.save(date, content, title, pageNumber);
    const data = await notesQuery.getByDate(date);
    set({ notes: data });
    return id;
  },
  deleteNote: async (id) => {
    await notesQuery.delete(id);
    const data = await notesQuery.getAll();
    set({ allNotes: data });
  },
  togglePin: async (id, isPinned) => {
    await notesQuery.togglePin(id, isPinned);
    const data = await notesQuery.getAll();
    set({ allNotes: data });
  },
}));

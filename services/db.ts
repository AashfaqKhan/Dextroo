import { User, ClassSession, Notification } from '../types';
import { supabase } from './supabase';

const USERS_KEY = 'academy_registered_users';
const FACULTY_KEY = 'academy_faculty_users';
const TIMETABLE_KEY = 'academy_timetable';
const NOTIF_KEY = 'academy_notifications';

// Helper to check if we should use DB
const useDB = () => !!supabase;

export const db = {
  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    if (useDB()) {
      const { data, error } = await supabase!.from('users').select('*');
      if (error) { console.error(error); return []; }
      return data || [];
    }
    const json = localStorage.getItem(USERS_KEY);
    return json ? JSON.parse(json) : [];
  },

  saveUser: async (user: User) => {
    if (useDB()) {
      // Note: For Supabase, you might need to handle file uploads (feeScreenshot) via Storage buckets
      // instead of base64 to avoid payload limits. For now, we strip base64 if it's too large.
      const { feeScreenshot, ...userData } = user; 
      await supabase!.from('users').insert([userData]);
    } else {
      const users = await db.getUsers();
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },
  
  // --- FACULTY ---
  getFaculty: async (): Promise<User[]> => {
    if (useDB()) {
      const { data, error } = await supabase!.from('faculty').select('*');
      return data || [];
    }
    const json = localStorage.getItem(FACULTY_KEY);
    return json ? JSON.parse(json) : [];
  },

  saveFaculty: async (facultyList: User[]) => {
    if (useDB()) {
      // In a real DB, you'd insert/update individually. 
      // This is a simplified overwrite for demo purposes or strictly local usage patterns.
      // Ideally, you'd add one by one.
    } else {
      localStorage.setItem(FACULTY_KEY, JSON.stringify(facultyList));
    }
  },

  addFacultyMember: async (member: User) => {
     if (useDB()) {
         await supabase!.from('faculty').insert([member]);
     } else {
         const list = await db.getFaculty();
         list.push(member);
         localStorage.setItem(FACULTY_KEY, JSON.stringify(list));
     }
  },

  deleteFacultyMember: async (username: string) => {
      if (useDB()) {
          await supabase!.from('faculty').delete().eq('username', username);
      } else {
          let list = await db.getFaculty();
          list = list.filter(f => f.username !== username);
          localStorage.setItem(FACULTY_KEY, JSON.stringify(list));
      }
  },

  // --- TIMETABLE ---
  getSchedule: async (): Promise<ClassSession[]> => {
    if (useDB()) {
      const { data } = await supabase!.from('timetable').select('*');
      return data || [];
    }
    const json = localStorage.getItem(TIMETABLE_KEY);
    return json ? JSON.parse(json) : [];
  },

  addClass: async (session: ClassSession) => {
    if (useDB()) {
        await supabase!.from('timetable').insert([session]);
    } else {
        const list = await db.getSchedule();
        list.push(session);
        localStorage.setItem(TIMETABLE_KEY, JSON.stringify(list));
    }
  },

  deleteClass: async (id: string) => {
      if (useDB()) {
          await supabase!.from('timetable').delete().eq('id', id);
      } else {
          let list = await db.getSchedule();
          list = list.filter(s => s.id !== id);
          localStorage.setItem(TIMETABLE_KEY, JSON.stringify(list));
      }
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (): Promise<Notification[]> => {
      if (useDB()) {
          const { data } = await supabase!.from('notifications').select('*').order('timestamp', { ascending: false }).limit(20);
          return data || [];
      }
      const json = localStorage.getItem(NOTIF_KEY);
      return json ? JSON.parse(json) : [];
  },

  addNotification: async (notif: Notification) => {
      if (useDB()) {
          await supabase!.from('notifications').insert([notif]);
      } else {
          const list = await db.getNotifications();
          const updated = [notif, ...list].slice(0, 20);
          localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
      }
  }
};
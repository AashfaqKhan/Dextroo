
export interface User {
  name: string;
  role: 'student' | 'admin' | 'faculty';
  
  // Student specific
  email?: string;
  phoneNumber?: string;
  qualification?: string;
  location?: string;
  age?: number;
  feeScreenshot?: string | null; // Base64 data URL
  
  // Faculty specific
  username?: string;
  password?: string;
  
  // Legacy support (optional)
  isAdmin?: boolean; 
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ClassSession {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  zoomLink?: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'timetable' | 'general';
}

export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  TTS = 'TTS',
  TIMETABLE = 'TIMETABLE'
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
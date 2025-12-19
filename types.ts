
export type ShiftType = 'Morning' | 'Afternoon' | 'Night' | 'OFF';

export interface StaffPreferences {
  unavailableDays: number[]; // 0-6 (Sun-Sat)
  unavailableDates: string[]; // ["YYYY-MM-DD"]
  preferredDates: string[]; // ["YYYY-MM-DD"]
  allowedShifts: ShiftType[]; // New: ['Morning', 'Afternoon', 'Night']
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatarUrl: string;
  status: 'online' | 'offline';
  preferences?: StaffPreferences;
}

export interface Shift {
  type: ShiftType;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface DailySchedule {
  date: string;
  dayName: string;
  isToday?: boolean;
  isWeekend?: boolean;
}

export interface StaffSchedule {
  staffId: string;
  shifts: Record<string, Shift>; // Key is date (YYYY-MM-DD)
}

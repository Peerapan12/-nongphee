
import React from 'react';
import { Staff, StaffSchedule, ShiftType } from '../types';
import { SHIFT_CONFIG } from '../constants';

interface CalendarViewProps {
  currentDate: Date;
  staffList: Staff[];
  schedule: StaffSchedule[];
  onDateClick: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, staffList, schedule, onDateClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  // Padding for start of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDaySchedule = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const assignments: Record<ShiftType, string[]> = {
      Morning: [],
      Afternoon: [],
      Night: [],
      OFF: []
    };

    schedule.forEach(s => {
      const shift = s.shifts[dateStr];
      if (shift && shift.type !== 'OFF') {
        assignments[shift.type].push(staffList.find(staff => staff.id === s.staffId)?.name || '');
      }
    });

    return assignments;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-surface-dark overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(d => (
          <div key={d} className="py-3 text-center text-[11px] font-black text-text-secondary uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
            {d}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6 overflow-y-auto custom-scrollbar">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="border-b border-r border-gray-50 dark:border-gray-800/50 bg-gray-50/20 dark:bg-gray-900/10"></div>;
          
          const sched = getDaySchedule(day);
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          const dObj = new Date(year, month, day);

          return (
            <div 
              key={day} 
              onClick={() => onDateClick(dObj)}
              className={`min-h-[120px] p-2 border-b border-r border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer flex flex-col gap-1.5 group ${isToday ? 'bg-primary/5' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`size-7 flex items-center justify-center text-sm font-black rounded-full transition-all ${isToday ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'text-text-main dark:text-gray-400'}`}>
                  {day}
                </span>
              </div>
              
              <div className="flex-1 space-y-2 overflow-hidden">
                {(['Morning', 'Afternoon', 'Night'] as ShiftType[]).map(type => (
                  sched[type].length > 0 && (
                    <div key={type} className="flex flex-col gap-0.5">
                      <div className="flex flex-wrap gap-1">
                        {sched[type].map((name, i) => (
                          <div 
                            key={i} 
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate max-w-full flex items-center gap-1 shadow-sm ${SHIFT_CONFIG[type].bg} ${SHIFT_CONFIG[type].text} border border-white/40 dark:border-black/20`}
                          >
                            <div className={`size-1 rounded-full ${SHIFT_CONFIG[type].dotColor}`}></div>
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;

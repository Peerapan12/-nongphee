
import React, { useState, useEffect } from 'react';
import { Staff, ShiftType } from '../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Staff) => void;
  editingStaff: Staff | null;
  baseDate: Date;
}

const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const SHIFT_PERIODS: { type: ShiftType; label: string; icon: string }[] = [
  { type: 'Morning', label: 'เช้า', icon: 'wb_sunny' },
  { type: 'Afternoon', label: 'บ่าย', icon: 'partly_cloudy_day' },
  { type: 'Night', label: 'ดึก', icon: 'dark_mode' },
];

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave, editingStaff, baseDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ca197ec2?auto=format&fit=crop&q=80&w=100&h=100',
  });

  const [unavailableDays, setUnavailableDays] = useState<number[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [preferredDates, setPreferredDates] = useState<string[]>([]);
  const [allowedShifts, setAllowedShifts] = useState<ShiftType[]>(['Morning', 'Afternoon', 'Night']);
  const [selectionMode, setSelectionMode] = useState<'unavailable' | 'preferred'>('preferred');

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name,
        role: editingStaff.role,
        phone: editingStaff.phone,
        avatarUrl: editingStaff.avatarUrl,
      });
      setUnavailableDays(editingStaff.preferences?.unavailableDays || []);
      setUnavailableDates(editingStaff.preferences?.unavailableDates || []);
      setPreferredDates(editingStaff.preferences?.preferredDates || []);
      setAllowedShifts(editingStaff.preferences?.allowedShifts || ['Morning', 'Afternoon', 'Night']);
    } else {
      setFormData({
        name: '',
        role: '',
        phone: '',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ca197ec2?auto=format&fit=crop&q=80&w=100&h=100',
      });
      setUnavailableDays([]);
      setUnavailableDates([]);
      setPreferredDates([]);
      setAllowedShifts(['Morning', 'Afternoon', 'Night']);
    }
  }, [editingStaff, isOpen]);

  if (!isOpen) return null;

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthDates: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    monthDates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: editingStaff ? editingStaff.id : `s${Date.now()}`,
      status: editingStaff ? editingStaff.status : 'offline',
      preferences: {
        unavailableDays,
        unavailableDates,
        preferredDates,
        allowedShifts
      }
    });
    onClose();
  };

  const toggleAllowedShift = (shift: ShiftType) => {
    setAllowedShifts(prev => 
      prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]
    );
  };

  const toggleDay = (day: number) => {
    setUnavailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleDate = (date: string) => {
    if (selectionMode === 'unavailable') {
      setUnavailableDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
      setPreferredDates(prev => prev.filter(d => d !== date));
    } else {
      setPreferredDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
      setUnavailableDates(prev => prev.filter(d => d !== date));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 custom-scrollbar">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-surface-dark z-10">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined font-black">settings_account_box</span>
             </div>
             <h3 className="text-xl font-black text-text-main dark:text-white">ตั้งค่าพยาบาล</h3>
          </div>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest">ชื่อ-นามสกุล</label>
              <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest">ตำแหน่ง</label>
              <input required type="text" className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 font-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            </div>
          </div>

          {/* Collective Shift Periods */}
          <div className="space-y-4">
            <h4 className="font-black text-text-main dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-primary">dynamic_form</span>
              เวรที่สามารถปฏิบัติหน้าที่ได้ (เช็คบ็อกรวม)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {SHIFT_PERIODS.map(({ type, label, icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleAllowedShift(type)}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                    allowedShifts.includes(type)
                    ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-text-secondary opacity-50 grayscale'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">{icon}</span>
                  <span className="text-xs font-black uppercase tracking-widest">เวร{label}</span>
                  <div className={`size-5 rounded-full border-2 flex items-center justify-center ${allowedShifts.includes(type) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {allowedShifts.includes(type) && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Off Days */}
          <div className="space-y-4">
            <h4 className="font-black text-text-main dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-red-500">event_busy</span>
              วันหยุดประจำสัปดาห์ (ไม่ว่างทุกอาทิตย์)
            </h4>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day, idx) => (
                <button 
                  key={day} 
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`px-4 py-2 flex-1 min-w-[80px] rounded-xl border-2 transition-all text-xs font-black ${
                    unavailableDays.includes(idx) 
                    ? 'bg-red-500 border-red-500 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-text-secondary hover:border-primary/30'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Special Date Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-text-main dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-orange-500">edit_calendar</span>
                วันที่ระบุพิเศษ (Preferred / Unavailable)
              </h4>
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button type="button" onClick={() => setSelectionMode('preferred')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${selectionMode === 'preferred' ? 'bg-white text-green-600 shadow-sm' : 'text-text-secondary'}`}>สะดวกพิเศษ</button>
                <button type="button" onClick={() => setSelectionMode('unavailable')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${selectionMode === 'unavailable' ? 'bg-white text-red-600 shadow-sm' : 'text-text-secondary'}`}>ไม่สะดวกพิเศษ</button>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
               <div className="grid grid-cols-7 gap-2">
                 {DAYS.map(d => <div key={d} className="text-[10px] font-black text-center text-text-secondary uppercase mb-2">{d.slice(0, 3)}</div>)}
                 {Array.from({ length: firstDay }).map((_, i) => <div key={`pad-${i}`}></div>)}
                 {monthDates.map(date => {
                   const dayNum = new Date(date).getDate();
                   const isPreferred = preferredDates.includes(date);
                   const isUnavailable = unavailableDates.includes(date);
                   
                   return (
                     <button
                       key={date}
                       type="button"
                       onClick={() => toggleDate(date)}
                       className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all border-2 ${
                         isPreferred ? 'bg-green-500 border-green-500 text-white shadow-lg' :
                         isUnavailable ? 'bg-red-500 border-red-500 text-white shadow-lg' :
                         'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-text-main dark:text-white hover:border-primary/50'
                       }`}
                     >
                       <span className="text-[10px] font-black">{dayNum}</span>
                       {isPreferred && <span className="material-symbols-outlined text-[10px] scale-75">star</span>}
                       {isUnavailable && <span className="material-symbols-outlined text-[10px] scale-75">block</span>}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-text-secondary font-black uppercase tracking-widest">ยกเลิก</button>
            <button type="submit" className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/30 active:scale-95 transition-all">
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;

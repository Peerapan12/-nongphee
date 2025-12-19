
import React, { useState, useEffect } from 'react';
import { Shift, ShiftType } from '../types';
import { SHIFT_CONFIG } from '../constants';

interface ShiftEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Shift) => void;
  currentShift: Shift;
  dateLabel: string;
  staffName: string;
}

const ShiftEditorModal: React.FC<ShiftEditorModalProps> = ({ isOpen, onClose, onSave, currentShift, dateLabel, staffName }) => {
  const [type, setType] = useState<ShiftType>(currentShift.type);
  const [startTime, setStartTime] = useState(currentShift.startTime);
  const [endTime, setEndTime] = useState(currentShift.endTime);

  useEffect(() => {
    setType(currentShift.type);
    setStartTime(currentShift.startTime);
    setEndTime(currentShift.endTime);
  }, [currentShift]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: ShiftType) => {
    setType(newType);
    if (newType === 'OFF') {
      setStartTime('00:00');
      setEndTime('00:00');
    } else {
      // Load defaults from config
      const config = SHIFT_CONFIG[newType];
      const [start, end] = config.timeRange.split(' - ');
      setStartTime(start);
      setEndTime(end);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6">
          <h3 className="text-lg font-black text-text-main dark:text-white">ปรับแก้เวลาเข้าเวร</h3>
          <p className="text-xs text-text-secondary mt-1">{staffName} | {dateLabel}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-black text-text-secondary uppercase mb-2 block">ประเภทเวร</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Morning', 'Afternoon', 'Night', 'OFF'] as ShiftType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    type === t 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-100 dark:border-gray-800 text-text-secondary hover:border-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {type !== 'OFF' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-text-secondary uppercase block">เวลาเริ่ม</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-text-secondary uppercase block">เวลาสิ้นสุด</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm font-bold"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-text-secondary">ยกเลิก</button>
          <button 
            onClick={() => onSave({ type, startTime, endTime })}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftEditorModal;

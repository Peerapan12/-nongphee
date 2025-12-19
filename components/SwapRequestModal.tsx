
import React, { useState } from 'react';
import { Staff } from '../types';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: Staff[];
  onConfirm: (data: any) => void;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({ isOpen, onClose, staffList, onConfirm }) => {
  const [fromStaff, setFromStaff] = useState('');
  const [toStaff, setToStaff] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromStaff || !toStaff || !date) return;
    onConfirm({ fromStaff, toStaff, date, reason });
    alert('ส่งคำขอแลกเวรเรียบร้อยแล้ว รอการอนุมัติจากหัวหน้าพยาบาล');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-black text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">swap_horiz</span>
            ขอแลกเปลี่ยนเวร
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-main transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase">ผู้ขอแลกเวร</label>
            <select 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
              value={fromStaff}
              onChange={e => setFromStaff(e.target.value)}
            >
              <option value="">เลือกพยาบาล...</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase">วันที่ต้องการแลก</label>
            <input 
              required
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase">แลกกับใคร</label>
            <select 
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
              value={toStaff}
              onChange={e => setToStaff(e.target.value)}
            >
              <option value="">เลือกพยาบาล...</option>
              {staffList.filter(s => s.id !== fromStaff).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-text-secondary uppercase">เหตุผล (ไม่บังคับ)</label>
            <textarea 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none resize-none"
              rows={2}
              placeholder="ระบุเหตุผลในการขอแลกเวร..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-text-secondary">ยกเลิก</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">ส่งคำขอ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequestModal;


import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import StaffModal from './components/StaffModal';
import ShiftEditorModal from './components/ShiftEditorModal';
import CalendarView from './components/CalendarView';
import SwapRequestModal from './components/SwapRequestModal';
import { SHIFT_CONFIG, STAFF_DATA } from './constants';
import { ShiftType, DailySchedule, StaffSchedule, Shift, Staff } from './types';
import { getSchedulingInsights } from './services/geminiService';

interface SwapRequest {
  id: string;
  fromStaffId: string;
  toStaffId: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const App: React.FC = () => {
  const [view, setView] = useState<'Day' | 'Week' | 'Month' | 'Calendar'>('Week');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 17)); // Oct 17, 2023
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    return STAFF_DATA.map(s => ({ ...s, phone: '081-234-5678' }));
  });
  const [schedule, setSchedule] = useState<StaffSchedule[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedBulkShift, setSelectedBulkShift] = useState<ShiftType>('Morning');

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [activeShiftContext, setActiveShiftContext] = useState<{ staffId: string, date: string, shift: Shift, staffName: string } | null>(null);
  
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const visibleDates = useMemo(() => {
    const dates: DailySchedule[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (view === 'Day') {
      dates.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: dayNames[currentDate.getDay()],
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
    } else if (view === 'Week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        dates.push({
          date: d.toISOString().split('T')[0],
          dayName: dayNames[d.getDay()],
          isToday: d.toDateString() === new Date().toDateString(),
          isWeekend: d.getDay() === 0 || d.getDay() === 6
        });
      }
    } else if (view === 'Month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        dates.push({
          date: d.toISOString().split('T')[0],
          dayName: dayNames[d.getDay()],
          isToday: d.toDateString() === new Date().toDateString(),
          isWeekend: d.getDay() === 0 || d.getDay() === 6
        });
      }
    }
    return dates;
  }, [view, currentDate]);

  useEffect(() => {
    setSchedule(prev => {
      const newSchedule = [...prev];
      staffList.forEach(staff => {
        let staffEntry = newSchedule.find(s => s.staffId === staff.id);
        if (!staffEntry) {
          staffEntry = { staffId: staff.id, shifts: {} };
          newSchedule.push(staffEntry);
        }
        visibleDates.forEach(d => {
          if (!staffEntry!.shifts[d.date]) {
            staffEntry!.shifts[d.date] = { type: 'OFF', startTime: '00:00', endTime: '00:00' };
          }
        });
      });
      return newSchedule;
    });
  }, [staffList, visibleDates]);

  const handleSaveStaff = (staff: Staff) => {
    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === staff.id ? staff : s));
    } else {
      setStaffList(prev => [...prev, staff]);
    }
    setEditingStaff(null);
  };

  const getStaffTotalHours = (staffId: string) => {
    const staffSched = schedule.find(s => s.staffId === staffId);
    if (!staffSched) return 0;
    return (Object.entries(staffSched.shifts) as [string, Shift][]).reduce((acc, [date, shift]) => {
      if (shift.type === 'OFF') return acc;
      const [sH, sM] = shift.startTime.split(':').map(Number);
      const [eH, eM] = shift.endTime.split(':').map(Number);
      let diff = (eH * 60 + eM) - (sH * 60 + sM);
      if (diff < 0) diff += 24 * 60;
      return acc + (diff / 60);
    }, 0);
  };

  const handleShiftCellClick = (staff: Staff, date: string) => {
    if (isBulkMode) {
      const config = SHIFT_CONFIG[selectedBulkShift];
      const [startTime, endTime] = selectedBulkShift === 'OFF' ? ['00:00', '00:00'] : config.timeRange.split(' - ');
      
      setSchedule(prev => prev.map(item => {
        if (item.staffId === staff.id) {
          return {
            ...item,
            shifts: { ...item.shifts, [date]: { type: selectedBulkShift, startTime, endTime } }
          };
        }
        return item;
      }));
      return;
    }

    const staffSched = schedule.find(s => s.staffId === staff.id);
    const currentShift = staffSched?.shifts[date] || { type: 'OFF', startTime: '00:00', endTime: '00:00' };
    
    setActiveShiftContext({
      staffId: staff.id,
      date,
      shift: currentShift,
      staffName: staff.name
    });
    setIsShiftModalOpen(true);
  };

  const handleSaveShiftDetails = (updatedShift: Shift) => {
    if (!activeShiftContext) return;
    setSchedule(prev => prev.map(item => {
      if (item.staffId === activeShiftContext.staffId) {
        return { ...item, shifts: { ...item.shifts, [activeShiftContext.date]: updatedShift } };
      }
      return item;
    }));
    setIsShiftModalOpen(false);
  };

  const navigateDate = (amount: number) => {
    const next = new Date(currentDate);
    if (view === 'Day') next.setDate(currentDate.getDate() + amount);
    else if (view === 'Week') next.setDate(currentDate.getDate() + (amount * 7));
    else next.setMonth(currentDate.getMonth() + amount);
    setCurrentDate(next);
  };

  // Fix: Added missing handleSwapRequest function
  const handleSwapRequest = (data: { fromStaff: string, toStaff: string, date: string, reason: string }) => {
    const newRequest: SwapRequest = {
      id: `swap-${Date.now()}`,
      fromStaffId: data.fromStaff,
      toStaffId: data.toStaff,
      date: data.date,
      reason: data.reason,
      status: 'pending'
    };
    setSwapRequests(prev => [...prev, newRequest]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-text-main dark:text-white text-3xl font-black tracking-tight flex items-center gap-3"> 
              <span className="material-symbols-outlined text-primary text-4xl">calendar_view_day</span>
              โรงพยาบาลเทพสตรี | Nurse Schedule
            </h2>
            <p className="text-text-secondary dark:text-gray-400 text-base">จัดการตารางเวรและการลา | {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
             <button onClick={async () => {
                setLoadingInsights(true);
                const result = await getSchedulingInsights({ staffList, schedule });
                setInsights(result);
                setLoadingInsights(false);
              }} disabled={loadingInsights} className="flex items-center gap-2 h-11 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">{loadingInsights ? 'sync' : 'auto_awesome'}</span>
              <span>{loadingInsights ? 'กำลังวิเคราะห์...' : 'AI วิเคราะห์เวร'}</span>
            </button>
            <button onClick={() => setIsSwapModalOpen(true)} className="flex items-center gap-2 h-11 px-5 bg-white dark:bg-gray-800 text-primary border border-primary/20 hover:border-primary rounded-xl text-sm font-bold shadow-sm transition-all">
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              <span>ขอแลกเวร</span>
            </button>
            <button onClick={() => { setEditingStaff(null); setIsStaffModalOpen(true); }} className="flex items-center gap-2 h-11 px-5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>เพิ่มพยาบาล</span>
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {insights && (
              <div className="mb-8 p-6 bg-white dark:bg-surface-dark border-l-4 border-purple-500 rounded-xl shadow-sm relative animate-in fade-in slide-in-from-left-4">
                <button onClick={() => setInsights(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                   <span className="material-symbols-outlined">close</span>
                </button>
                <h3 className="text-purple-600 font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">psychology</span>
                  AI Insights & Suggestions
                </h3>
                <p className="text-text-main dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{insights}</p>
              </div>
            )}

            {/* Bulk Mode Toolbar */}
            <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-3xl border border-primary/20">
              <div className="flex items-center gap-3">
                 <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${isBulkMode ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-primary'}`}>
                    <span className="material-symbols-outlined">{isBulkMode ? 'edit_square' : 'touch_app'}</span>
                 </div>
                 <div>
                    <p className="text-sm font-black text-text-main dark:text-white uppercase tracking-tight">โหมดจัดเวรด่วน (Bulk Assign)</p>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{isBulkMode ? 'กำลังใช้งาน: คลิกที่เซลล์เพื่อลงเวรทันที' : 'เปิดใช้งานเพื่อลงเวรจำนวนมากอย่างรวดเร็ว'}</p>
                 </div>
              </div>
              <div className="h-10 w-[1px] bg-primary/20 hidden sm:block mx-2"></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsBulkMode(!isBulkMode)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isBulkMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
                  {isBulkMode ? 'ปิดโหมดด่วน' : 'เปิดโหมดด่วน'}
                </button>
                {isBulkMode && (
                  <div className="flex p-1 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-primary/10 ml-4 animate-in slide-in-from-left-4">
                    {(['Morning', 'Afternoon', 'Night', 'OFF'] as ShiftType[]).map(s => (
                      <button key={s} onClick={() => setSelectedBulkShift(s)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${selectedBulkShift === s ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-primary'}`}>
                        {s === 'Morning' ? 'เช้า' : s === 'Afternoon' ? 'บ่าย' : s === 'Night' ? 'ดึก' : 'OFF'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard label="บุคลากร" value={staffList.length} icon="groups" iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" />
              <StatsCard label="ความจุวอร์ด" value="95%" icon="bed" iconBg="bg-orange-50 dark:bg-orange-900/20" iconColor="text-orange-600" />
              <StatsCard label="ปฏิบัติหน้าที่วันนี้" value={schedule.filter(s => s.shifts[new Date().toISOString().split('T')[0]]?.type !== 'OFF').length} icon="event_available" iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" />
              <StatsCard label="ชั่วโมงรวมทั้งวอร์ด" value={Math.round(staffList.reduce((acc, s) => acc + getStaffTotalHours(s.id), 0))} icon="timer" iconBg="bg-teal-50 dark:bg-teal-900/20" iconColor="text-teal-600" />
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col min-h-[750px]">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/30 dark:bg-gray-800/20">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <button onClick={() => navigateDate(-1)} className="size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-text-secondary transition-all">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <div className="px-6 font-black text-sm min-w-[200px] text-center text-text-main dark:text-white uppercase tracking-tight">
                    {view === 'Day' && currentDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {view === 'Week' && `สัปดาห์ ${Math.ceil(currentDate.getDate() / 7)} | ${currentDate.toLocaleDateString('th-TH', { month: 'short' })}`}
                    {(view === 'Month' || view === 'Calendar') && currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                  </div>
                  <button onClick={() => navigateDate(1)} className="size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-text-secondary transition-all">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-full md:w-auto">
                  {(['Day', 'Week', 'Month', 'Calendar'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)} className={`flex-1 md:flex-none px-6 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${view === v ? 'bg-white dark:bg-gray-700 text-primary shadow-lg ring-1 ring-black/5' : 'text-text-secondary hover:text-text-main'}`}>
                      {v === 'Day' ? 'รายวัน' : v === 'Week' ? 'สัปดาห์' : v === 'Month' ? 'รายเดือน' : 'ปฏิทิน'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full border-separate border-spacing-0">
                  <thead className="bg-gray-50/90 dark:bg-gray-800/80 backdrop-blur-xl sticky top-0 z-20">
                    <tr>
                      <th className="sticky-col left-0 bg-white/95 dark:bg-surface-dark/95 z-30 p-5 text-left border-b border-r border-gray-100 dark:border-gray-800 min-w-[280px]">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">ชื่อ-สกุล / ชั่วโมงงาน</span>
                      </th>
                      {visibleDates.map(day => (
                        <th key={day.date} className={`p-4 text-center border-b border-gray-100 dark:border-gray-800 min-w-[130px] ${day.isToday ? 'bg-primary/5' : ''}`}>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`text-[10px] uppercase font-black ${day.isWeekend ? 'text-red-400' : 'text-text-secondary'}`}>{day.dayName}</span>
                            <span className={`text-xl font-black ${day.isToday ? 'text-primary' : 'text-text-main dark:text-white'}`}>{day.date.split('-')[2]}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {staffList.map(staff => {
                      const staffSched = schedule.find(s => s.staffId === staff.id);
                      return (
                        <tr key={staff.id} className="group hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors">
                          <td className="sticky-col left-0 bg-white/95 dark:bg-surface-dark/95 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 p-4 border-r border-gray-100 dark:border-gray-800 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 overflow-hidden">
                                <div className="relative flex-shrink-0">
                                  <div className="size-11 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-gray-700 shadow-md" style={{ backgroundImage: `url("${staff.avatarUrl}")` }}></div>
                                  <div className={`absolute -bottom-0.5 -right-0.5 size-3.5 border-2 border-white dark:border-surface-dark rounded-full ${staff.status === 'online' ? 'bg-green-500' : 'bg-gray-300 shadow-sm'}`}></div>
                                </div>
                                <div className="overflow-hidden text-left">
                                  <p className="text-sm font-black text-text-main dark:text-white truncate">{staff.name}</p>
                                  <p className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-primary/10 text-primary w-fit">{getStaffTotalHours(staff.id).toFixed(1)}h</p>
                                </div>
                              </div>
                              <button onClick={() => { setEditingStaff(staff); setIsStaffModalOpen(true); }} className="size-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary/10 text-primary flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined text-[18px]">settings</span>
                              </button>
                            </div>
                          </td>
                          {visibleDates.map(day => {
                            const shift = staffSched?.shifts[day.date];
                            const config = SHIFT_CONFIG[shift?.type || 'OFF'];
                            const dayNum = new Date(day.date).getDay();
                            
                            // Hierarchy of availability
                            const isSpecificUnavailable = staff.preferences?.unavailableDates.includes(day.date);
                            const isWeeklyUnavailable = staff.preferences?.unavailableDays.includes(dayNum);
                            const isPreferred = staff.preferences?.preferredDates.includes(day.date);
                            const isAllowed = !staff.preferences?.allowedShifts || staff.preferences.allowedShifts.includes(selectedBulkShift);

                            const isBlocked = isSpecificUnavailable || isWeeklyUnavailable;
                            
                            return (
                              <td key={`${staff.id}-${day.date}`} className={`p-2 border-r border-gray-50 dark:border-gray-800 text-center relative overflow-hidden ${day.isToday ? 'bg-primary/5' : ''}`}>
                                <div 
                                  onClick={() => handleShiftCellClick(staff, day.date)}
                                  className={`h-16 w-full rounded-2xl ${config.bg} ${config.text} text-[10px] font-black flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all select-none border-2 border-transparent shadow-sm ${isBulkMode && !isAllowed && selectedBulkShift !== 'OFF' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                  {shift?.type !== 'OFF' ? (
                                    <>
                                      <span className="flex items-center gap-1.5 uppercase">{config.label}</span>
                                      <span className="opacity-80 text-[8px] font-black mt-1 uppercase tracking-wider">{shift.startTime} - {shift.endTime}</span>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      {isBlocked ? (
                                        <>
                                          <span className="material-symbols-outlined text-red-500 text-[18px]">block</span>
                                          <span className="text-red-500 uppercase text-[8px] mt-0.5">ไม่สะดวก</span>
                                        </>
                                      ) : isPreferred ? (
                                        <>
                                          <span className="material-symbols-outlined text-yellow-500 text-[18px]">star</span>
                                          <span className="text-green-600 uppercase text-[8px] mt-0.5">สะดวกมาก</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="material-symbols-outlined text-green-500/50 text-[18px]">check_circle</span>
                                          <span className="text-text-secondary uppercase text-[8px] mt-0.5">ว่าง</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {/* Placeholder for other tabs if needed */}
      </main>

      <StaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSave={handleSaveStaff} editingStaff={editingStaff} baseDate={currentDate} />
      <SwapRequestModal isOpen={isSwapModalOpen} onClose={() => setIsSwapModalOpen(false)} staffList={staffList} onConfirm={handleSwapRequest} />
      {activeShiftContext && <ShiftEditorModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} onSave={handleSaveShiftDetails} currentShift={activeShiftContext.shift} dateLabel={activeShiftContext.date} staffName={activeShiftContext.staffName} />}
    </div>
  );
};

export default App;


import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white dark:bg-surface-dark border-b border-[#f0f2f4] dark:border-gray-800 sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[28px]">local_hospital</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-text-main dark:text-white text-lg font-bold leading-tight">โรงพยาบาลเทพสตรี</h1>
              <p className="text-text-secondary text-xs font-medium">ระบบจัดการตารางเวรพยาบาล</p>
            </div>
          </div>

          <nav className="hidden md:flex flex-1 justify-center gap-8 h-full">
            {[
              { id: 'dashboard', label: 'แดชบอร์ด' },
              { id: 'staff', label: 'รายชื่อบุคลากร' },
              { id: 'requests', label: 'คำร้องขอ' },
              { id: 'reports', label: 'รายงาน' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-bold transition-all border-b-2 h-full px-2 ${
                  activeTab === tab.id 
                  ? 'text-primary border-primary' 
                  : 'text-text-secondary dark:text-gray-400 border-transparent hover:text-text-main dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert('ไม่มีการแจ้งเตือนใหม่')}
              className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
            </button>
            <button 
              onClick={() => alert('เปิดเมนูการตั้งค่า')}
              className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <div className="flex items-center gap-3 pl-1 cursor-pointer group" onClick={() => alert('โปรไฟล์หัวหน้าพยาบาล')}>
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-white shadow-sm ring-0 group-hover:ring-2 ring-primary/20 transition-all"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559839734-2b71ca197ec2?auto=format&fit=crop&q=80&w=100&h=100")' }}
              ></div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold text-text-main dark:text-white leading-none">พว. สมศรี</p>
                <p className="text-xs text-text-secondary mt-1">หัวหน้าพยาบาล</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

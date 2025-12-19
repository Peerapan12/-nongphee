
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, iconBg, iconColor }) => {
  return (
    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors">
      <div className="flex flex-col gap-1">
        <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-text-main dark:text-white text-3xl font-bold">{value}</p>
      </div>
      <div className={`size-10 rounded-full ${iconBg} ${iconColor} flex items-center justify-center`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
  );
};

export default StatsCard;

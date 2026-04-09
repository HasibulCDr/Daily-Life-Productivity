import React from 'react';
import type { Task } from '../types';
import { motion } from 'framer-motion';

interface StatsBarProps {
  tasks: Task[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ tasks }) => {
  if (tasks.length === 0) return null;

  const total = tasks.length;
  const completed = tasks.filter(t => t.is_completed).length;
  const percentage = Math.round((completed / total) * 100) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
        <p className="text-sm text-gray-500">
          You completed {completed} out of {total} tasks today {percentage === 100 ? '🎉' : '🚀'}
        </p>
      </div>
      <div className="w-full md:w-1/2 flex items-center gap-3">
        <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${percentage === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
          />
        </div>
        <span className="text-sm font-bold text-gray-700 min-w-[40px] text-right">{percentage}%</span>
      </div>
    </motion.div>
  );
};

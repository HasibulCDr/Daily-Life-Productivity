import React, { useState } from 'react';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';
import { Sparkles, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading, onToggle, onDelete, onEdit }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  // Sort tasks: pending first, then completed. Then by creation date (newest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.is_completed === b.is_completed) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return a.is_completed ? 1 : -1;
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      {/* Smart Filters */}
      {tasks.length > 0 && (
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
          {['all', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`relative px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors duration-200 z-10 ${
                filter === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {filter === tab && (
                <motion.div
                  layoutId="filter-bubble"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-1 relative">
        <AnimatePresence mode="popLayout">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
              <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-full mb-6 relative">
                {filter === 'completed' ? (
                  <Sparkles className="w-10 h-10 text-amber-400" />
                ) : (
                  <Inbox className="w-10 h-10 text-indigo-200" />
                )}
                {/* Decorative floating dot */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filter === 'all' && (tasks.length === 0 ? 'No tasks yet.' : 'Nothing matches')}
                {filter === 'active' && 'All caught up!'}
                {filter === 'completed' && 'No completed tasks yet.'}
              </h3>
              
              <p className="text-gray-500 max-w-sm">
                {filter === 'all' && tasks.length === 0 && 'Start your productivity journey 🚀'}
                {filter === 'active' && 'Add some tasks to get started, or take a break.'}
                {filter === 'completed' && 'Your completed tasks will appear here. Get to work!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

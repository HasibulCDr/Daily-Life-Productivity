import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';
import { Check, Trash2, Edit2, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCompleted = task.is_completed;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onEdit(task.id, trimmed);
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  // Due Date Logic
  let urgencyFormat = null;
  if (task.due_date && !isCompleted) {
    const dueDate = new Date(task.due_date);
    const now = new Date();
    
    const dDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = dDay.getTime() - nowDay.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays < 0) {
      urgencyFormat = { color: 'text-red-500', bg: 'bg-red-50 border-red-200', icon: '🔴', text: 'Overdue' };
    } else if (diffDays === 0) {
      urgencyFormat = { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: '🟡', text: 'Today' };
    } else {
      urgencyFormat = { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: '🟢', text: 'Upcoming' };
    }
  }

  // Checkbox micro-animation variations
  const checkboxVariants = {
    checked: { scale: 1, backgroundColor: "#6366f1", borderColor: "#6366f1" },
    unchecked: { scale: 1, backgroundColor: "transparent", borderColor: "#d1d5db" }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25 }}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-3 bg-white rounded-2xl border transition-all duration-300 hover:shadow-md ${isCompleted ? 'border-gray-100 bg-gray-50/70' : 'border-gray-200'}`}
    >
      <div className="flex items-center flex-1 min-w-0 mr-4">
        
        <motion.button
          variants={checkboxVariants}
          initial={false}
          animate={isCompleted ? "checked" : "unchecked"}
          whileTap={{ scale: 0.8 }}
          onClick={() => onToggle(task.id, task.is_completed)}
          className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors duration-200"
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isCompleted ? 1 : 0, opacity: isCompleted ? 1 : 0 }}
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        </motion.button>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full text-lg outline-none bg-transparent border-b border-indigo-500 px-1 py-0.5"
            />
          ) : (
            <span 
              onClick={() => !isCompleted && setIsEditing(true)}
              className={`text-lg truncate transition-colors duration-300 ${!isCompleted && 'cursor-pointer hover:text-indigo-600'} ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
              }`}
              title="Click to edit"
            >
              {task.title}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 sm:mt-0 ml-10 sm:ml-0 gap-4">
        
        {/* Due Date Indicator */}
        {task.due_date && !isCompleted && urgencyFormat && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${urgencyFormat.bg} ${urgencyFormat.color}`}>
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{format(new Date(task.due_date), 'MMM d')}</span>
            <span className="ml-0.5 text-[0.65rem]">{urgencyFormat.icon}</span>
          </div>
        )}

        <div className="flex items-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label="Edit task"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setEditTitle(task.title);
                setIsEditing(false);
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Cancel edit"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

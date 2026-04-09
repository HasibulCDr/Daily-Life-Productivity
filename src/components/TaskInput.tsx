import React, { useState } from 'react';
import { Plus, Loader2, Calendar } from 'lucide-react';

interface TaskInputProps {
  onAdd: (title: string, dueDate: string | undefined) => Promise<void>;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAdd(trimmedTitle, dueDate || undefined);
      setTitle('');
      setDueDate('');
      setError('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center group">
        <div className="relative flex-1 w-full flex items-center shadow-sm">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="What needs to be done?"
            className={`w-full px-5 py-4 bg-white rounded-2xl border ${
              error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
            } outline-none transition-all duration-200 text-lg shadow-sm focus:shadow-md pr-5`}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="relative w-full sm:w-auto min-w-[160px] flex items-center bg-white rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 shadow-sm transition-all duration-200">
          <Calendar className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full pl-10 pr-4 py-4 bg-transparent outline-none text-gray-700 cursor-pointer"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-medium rounded-2xl hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm sm:min-w-[140px]"
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </>
          )}
        </button>
      </form>
      {error && (
        <p className="absolute -bottom-6 left-2 text-sm text-red-500 animate-pulse">{error}</p>
      )}
    </div>
  );
};

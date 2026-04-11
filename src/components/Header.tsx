import React from 'react';
import { ListTodo, LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onSignupClick, onLogoutClick }) => {
  return (
    <header className="py-6 flex justify-between items-center mb-8 relative">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-500/10 rounded-xl">
          <ListTodo className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Plan Your Day</h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">A simple task management app to organize your daily life.</p>
        </div>
      </div>

      <div className="flex items-center">
        {!user ? (
          <div className="flex gap-3">
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
            >
              Log in
            </button>
            <button 
              onClick={onSignupClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
            >
              Sign up
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center bg-white border border-gray-200 py-1.5 pl-2 pr-4 rounded-full shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user.email?.split('@')[0]}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <button 
              onClick={onLogoutClick}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

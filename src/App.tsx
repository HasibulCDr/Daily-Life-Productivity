import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from './types';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Auth logic states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    // 🔄 Persist Session
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    // Listen for auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (!currentUser) {
           setTasks([]); // clear tasks on logout safely
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully');
  };

  // --- Real Supabase DB API Functions with Optimistic UI ---
  
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    } else if (error) {
      toast.error('Failed to load tasks');
    }
    setIsLoading(false);
  }, [user]);

  const createTask = async (title: string, dueDate?: string) => {
    if (!user) {
      toast.error('You must log in to add tasks');
      return; 
    }

    // Optimistic UI - setup temporary id
    const tempId = uuidv4();
    const newTask: Task = {
      id: tempId,
      user_id: user.id,
      title,
      is_completed: false,
      created_at: new Date().toISOString(),
      due_date: dueDate,
    };
    
    setTasks(prev => [newTask, ...prev]);

    // Real DB async request
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, user_id: user.id, due_date: dueDate }])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create task');
      // Revert optimism setup
      setTasks(prev => prev.filter(t => t.id !== tempId));
    } else if (data) {
      toast.success('Task added successfully');
      // Apply exact DB-assigned task record to drop the tempId
      setTasks(prev => prev.map(t => t.id === tempId ? data : t));
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) {
      toast.error('Session error, please log in');
      return;
    }

    // Capture previous state for rollback if needed
    const previousTasks = [...tasks];

    // Optimistic UI
    setTasks(prev => {
      return prev.map(task => task.id === id ? { ...task, ...updates } : task);
    });

    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update task');
      // Revert optimism setup
      setTasks(previousTasks);
    } else {
      if (updates.is_completed !== undefined) {
         // Subtle confirmation (if we want toasts on completion, otherwise don't clutter)
         // Only toast when actually completed
         if (updates.is_completed) toast.success('Task completed ✨');
      } else {
         toast.success('Task updated');
      }
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const previousTasks = [...tasks];

    // Optimistic UI
    setTasks(prev => prev.filter(task => task.id !== id));

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete task');
      // Revert
      setTasks(previousTasks);
    } else {
      toast.success('Task deleted');
    }
  };

  // --- Handlers ---

  const handleToggleTask = (id: string, isCompleted: boolean) => {
    updateTask(id, { is_completed: !isCompleted });
  };

  const handleEditTask = (id: string, newTitle: string) => {
    updateTask(id, { title: newTitle });
  };

  // --- Initialization ---

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6">
      <Toaster 
        toastOptions={{ 
          className: 'shadow-md border border-gray-100/50', 
          duration: 3000,
          style: { borderRadius: '12px', background: '#fff', color: '#111827' }
        }} 
      />
      
      <div className="max-w-3xl mx-auto">
        
        <Header 
          user={user} 
          onLoginClick={() => openAuthModal('login')}
          onSignupClick={() => openAuthModal('signup')}
          onLogoutClick={handleLogout}
        />
        
        <main className="mt-8 transition-all duration-300 flex flex-col gap-2">
          {user && !isLoading && <StatsBar tasks={tasks} />}
          
          <TaskInput onAdd={createTask} />
          
          <TaskList 
            tasks={tasks} 
            isLoading={isLoading}
            onToggle={handleToggleTask} 
            onDelete={deleteTask}
            onEdit={handleEditTask}
          />
        </main>
        
        <footer className="mt-16 text-center text-sm text-gray-400">
          <p>Designed for focus & productivity.</p>
        </footer>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </div>
  );
}

export default App;

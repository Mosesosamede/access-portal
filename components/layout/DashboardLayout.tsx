'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, BookOpen, GraduationCap, Briefcase, User, Settings, LogOut, ChevronDown, Lock } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [lockedModal, setLockedModal] = useState(false);
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    // Fetch applicant data
    const fetchApplicantData = async () => {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
            const { data: applicant } = await supabase.from('applicants').select('progress_percent, current_stage').eq('user_id', data.user.id).single();
            if (applicant) {
                setTrainingProgress(applicant.progress_percent || 0);
                setCurrentStage(parseInt(applicant.current_stage) || 1);
            }
        } else {
            setTrainingProgress(0); // Mock for testing
            setCurrentStage(0); // Mock for testing
        }
    }
    fetchApplicantData();
  }, []);

  const isLocked = currentStage <= 5;

  return (
    <div className="min-h-screen bg-[rgb(38,47,44)] text-[#E0E6ED] flex">
      <AnimatePresence>
        {lockedModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setLockedModal(false)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 text-center max-w-sm">
                    <Lock size={48} className="text-[#DFFF00] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Job Pool Locked</h3>
                    <p className="text-sm text-gray-400">Please complete 100% of your training to unlock the Job Pool.</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[rgb(38,47,44)]/50 backdrop-blur-md p-6 flex flex-col justify-between">
        <nav className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/handbook" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition">
            <BookOpen size={20} />
            My Handbook
          </Link>
          <Link href="/dashboard/training-hub" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition">
            <GraduationCap size={20} />
            Training Hub
          </Link>
          <div className="relative">
            {isLocked ? (
                <button onClick={() => setLockedModal(true)} className="flex w-full items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/5 transition opacity-50 cursor-pointer">
                    <span className="flex items-center gap-3"><Briefcase size={20} /> Job Pool</span>
                    <Lock size={16} />
                </button>
            ) : (
                <Link href="/dashboard/job-pool" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition">
                    <Briefcase size={20} />
                    Job Pool
                </Link>
            )}
          </div>
          <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition">
            <User size={20} />
            Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="border-b border-white/10 bg-[rgb(38,47,44)]/80 backdrop-blur-lg p-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-lg font-semibold">{greeting}, Candidate</h1>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition">
              <User size={18} />
              <span className="text-sm">Profile</span>
              <ChevronDown size={14} />
            </button>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-48 bg-[rgb(50,60,55)] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                <Link href="/dashboard/settings" className="block p-3 hover:bg-white/5">Settings</Link>
                <Link href="/dashboard/profile" className="block p-3 hover:bg-white/5">Profile</Link>
                <Link href="/dashboard/skills" className="block p-3 hover:bg-white/5">Skills</Link>
                <Link href="/dashboard/preferences" className="block p-3 hover:bg-white/5">Preferences</Link>
                <button className="w-full text-left p-3 text-red-400 hover:bg-white/5 flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </div>
        </header>
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

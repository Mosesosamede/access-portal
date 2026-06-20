'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, BookOpen, GraduationCap, Briefcase, User, Settings, LogOut, ChevronDown, Lock, Loader2, Menu, X, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useApplicant } from '@/components/ApplicantContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { applicant, quizSubmissions, isLoading, user } = useApplicant();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lockedModal, setLockedModal] = useState(false);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(38,47,44)] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const completedQuizzesCount = Array.from(new Set(quizSubmissions.map(sub => sub.module_number))).length;
  const isLocked = !applicant || completedQuizzesCount < 5;

  return (
    <div className="min-h-screen bg-[#1a2321] text-[#E0E6ED] flex">
      <AnimatePresence>
        {lockedModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLockedModal(false)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#26312f] p-8 rounded-3xl border border-white/10 text-center max-w-sm" onClick={e => e.stopPropagation()}>
                    <Lock size={48} className="text-[#DFFF00] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-white">Job Pool Locked</h3>
                    <p className="text-sm text-gray-400">Please complete 100% of your training to unlock the Job Pool.</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 border-r border-[#dbf0de]/10 bg-[#1a2321] p-6 transition-all duration-300 md:static ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0'} ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className="flex items-center justify-between mb-8">
            <h2 className={`text-xl font-bold text-[#dbf0de] ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Deloxe</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X /></button>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:block text-gray-400 hover:text-[#dbf0de] transition-colors">
              <Menu size={20} />
            </button>
        </div>
        <NavLinks pathname={pathname} setSidebarOpen={setSidebarOpen} isLocked={isLocked} setLockedModal={setLockedModal} isSidebarCollapsed={isSidebarCollapsed} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="border-b border-[#dbf0de]/10 bg-[#1a2321]/80 backdrop-blur-lg p-4 flex justify-between items-center sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden"><Menu /></button>
          <h1 className="text-sm md:text-lg font-semibold truncate text-[#dbf0de]">{greeting}, {applicant?.full_name || user?.email || 'Candidate'}</h1>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-[#dbf0de]/5 rounded-full hover:bg-[#dbf0de]/10 transition text-[#dbf0de]">
              <User size={16} />
              <ChevronDown size={12} />
            </button>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-48 bg-[#26312f] border border-[#dbf0de]/10 rounded-xl overflow-hidden shadow-xl z-50">
                <Link href="/dashboard/settings" className="block p-3 hover:bg-[#dbf0de]/5 text-[#dbf0de]">Settings</Link>
                <Link href="/dashboard/profile" className="block p-3 hover:bg-[#dbf0de]/5 text-[#dbf0de]">Profile</Link>
                <Link href="/dashboard/skills" className="block p-3 hover:bg-[#dbf0de]/5 text-[#dbf0de]">Skills</Link>
                <Link href="/dashboard/preferences" className="block p-3 hover:bg-[#dbf0de]/5 text-[#dbf0de]">Preferences</Link>
                <button onClick={handleLogout} className="w-full text-left p-3 text-red-400 hover:bg-white/5 flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </div>
        </header>
        <main className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLinks({ pathname, setSidebarOpen, isLocked, setLockedModal, isSidebarCollapsed }: any) {
  return (
    <nav className="space-y-4">
      {[
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/handbook', label: 'My Handbook', icon: BookOpen },
        { href: '/dashboard/training-hub', label: 'Training Hub', icon: GraduationCap },
        { href: '/dashboard/professional-exam', label: 'Professional Exam', icon: Award },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
      ].map(link => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center transition-all ${
              isSidebarCollapsed 
                ? `w-11 h-11 rounded-full mx-auto justify-center ${isActive ? 'bg-[#DFFF00] text-[rgb(38,47,44)] shadow-[0_0_12px_rgba(223,255,0,0.4)]' : 'hover:bg-white/5 text-[#E0E6ED]'}` 
                : `gap-3 p-3 rounded-xl ${isActive ? 'bg-[#DFFF00] text-[rgb(38,47,44)]' : 'hover:bg-white/5 text-[#E0E6ED]'}`
            }`}
          >
            <link.icon size={20} className="flex-shrink-0" />
            <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>{link.label}</span>
          </Link>
        );
      })}
      <div className="relative">
        {isLocked ? (
            <button 
              onClick={() => {setLockedModal(true); setSidebarOpen(false);}} 
              className={`flex items-center transition opacity-40 cursor-not-allowed ${
                isSidebarCollapsed 
                  ? 'w-11 h-11 rounded-full mx-auto justify-center hover:bg-white/5' 
                  : 'w-full gap-3 p-3 rounded-xl justify-between hover:bg-white/5'
              }`}
            >
                <span className="flex items-center gap-3">
                  <Briefcase size={20} className="flex-shrink-0" /> 
                  <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Job Pool</span>
                </span>
                <Lock size={16} className={`${isSidebarCollapsed ? 'hidden' : 'block'}`} />
            </button>
        ) : (
            <Link 
              href="/dashboard/job-pool" 
              onClick={() => setSidebarOpen(false)} 
              className={`flex items-center transition-all ${
                pathname === '/dashboard/job-pool' 
                  ? (isSidebarCollapsed ? 'bg-[#DFFF00] text-[rgb(38,47,44)] w-11 h-11 rounded-full mx-auto justify-center shadow-[0_0_12px_rgba(223,255,0,0.4)]' : 'bg-[#DFFF00] text-[rgb(38,47,44)] p-3 rounded-xl gap-3')
                  : (isSidebarCollapsed ? 'hover:bg-white/5 w-11 h-11 rounded-full mx-auto justify-center' : 'hover:bg-white/5 p-3 rounded-xl gap-3')
              }`}
            >
                <Briefcase size={20} className="flex-shrink-0" />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Job Pool</span>
            </Link>
        )}
      </div>
    </nav>
  )
}

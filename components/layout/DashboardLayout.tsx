'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, BookOpen, GraduationCap, Briefcase, User, Settings, LogOut, ChevronDown, Lock, Loader2, Menu, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useApplicant } from '@/components/ApplicantContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { applicant, isLoading, user } = useApplicant();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const isLocked = !applicant || applicant.progress_percent < 100;

  const NavLinks = () => (
    <nav className="space-y-4">
      {[
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/handbook', label: 'My Handbook', icon: BookOpen },
        { href: '/dashboard/training-hub', label: 'Training Hub', icon: GraduationCap },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
      ].map(link => (
        <Link 
          key={link.href} 
          href={link.href} 
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 p-3 rounded-xl transition ${pathname === link.href ? 'bg-[#DFFF00] text-[rgb(38,47,44)]' : 'hover:bg-white/5'}`}
        >
          <link.icon size={20} />
          {link.label}
        </Link>
      ))}
      <div className="relative">
        {isLocked ? (
            <button onClick={() => {setLockedModal(true); setSidebarOpen(false);}} className="flex w-full items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/5 transition opacity-50 cursor-pointer">
                <span className="flex items-center gap-3"><Briefcase size={20} /> Job Pool</span>
                <Lock size={16} />
            </button>
        ) : (
            <Link href="/dashboard/job-pool" onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition ${pathname === '/dashboard/job-pool' ? 'bg-[#DFFF00] text-[rgb(38,47,44)]' : 'hover:bg-white/5'}`}>
                <Briefcase size={20} />
                Job Pool
            </Link>
        )}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[rgb(38,47,44)] text-[#E0E6ED] flex">
      <AnimatePresence>
        {lockedModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLockedModal(false)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 text-center max-w-sm" onClick={e => e.stopPropagation()}>
                    <Lock size={48} className="text-[#DFFF00] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Job Pool Locked</h3>
                    <p className="text-sm text-gray-400">Please complete 100% of your training to unlock the Job Pool.</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-[rgb(38,47,44)] p-6 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#DFFF00]">Deloxe</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X /></button>
        </div>
        <NavLinks />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="border-b border-white/10 bg-[rgb(38,47,44)]/80 backdrop-blur-lg p-4 flex justify-between items-center sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden"><Menu /></button>
          <h1 className="text-sm md:text-lg font-semibold truncate">{greeting}, {applicant?.full_name || user?.email || 'Candidate'}</h1>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition">
              <User size={16} />
              <ChevronDown size={12} />
            </button>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-48 bg-[rgb(50,60,55)] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                <Link href="/dashboard/settings" className="block p-3 hover:bg-white/5">Settings</Link>
                <Link href="/dashboard/profile" className="block p-3 hover:bg-white/5">Profile</Link>
                <Link href="/dashboard/skills" className="block p-3 hover:bg-white/5">Skills</Link>
                <Link href="/dashboard/preferences" className="block p-3 hover:bg-white/5">Preferences</Link>
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

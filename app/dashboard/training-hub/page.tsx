'use client';
import { useState } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, Lock, Unlock, ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function TrainingHubPage() {
  const { modules, completedModules, isLoading } = useApplicant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
      </div>
    );
  }

  const isModuleLocked = (moduleNumber: number) => {
    if (moduleNumber === 1) return false;
    return !completedModules.some(log => log.module_number === moduleNumber - 1);
  };

  const isModuleCompleted = (moduleNumber: number) => {
    return completedModules.some(log => log.module_number === moduleNumber);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-3 bg-[rgb(50,60,55)] rounded-full hover:bg-white/10 transition flex items-center justify-center">
          <ArrowLeft size={22} className="text-[#DFFF00]" />
        </Link>
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Training Hub</h2>
            <p className='text-gray-400 mt-1'>Continue your learning journey and unlock your full potential.</p>
        </div>
      </div>
      
      <div className='bg-[#f7f069] p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl'>
        <h3 className='text-xl font-bold mb-8 flex items-center gap-3 text-[#1a2321]'><GraduationCap className='text-[#1a2321]' /> Available Modules</h3>
        <div className='space-y-4'>
        {modules.map(m => {
            const locked = isModuleLocked(m.module_number);
            const completed = isModuleCompleted(m.module_number);
            return (
                <Link 
                    key={m.id} 
                    href={locked ? '#' : `/dashboard/training-hub/${m.module_number}`}
                    className={`block w-full text-left p-5 rounded-2xl flex items-center justify-between border ${locked ? 'opacity-50 cursor-not-allowed bg-white/5 border-transparent' : 'hover:bg-white/10 bg-[rgb(38,47,44)] hover:border-[#DFFF00]/50 border-white/5'} transition-all group`}
                >
                    <span className='font-medium group-hover:text-[#1a2321]'>{m.title}</span>
                    {locked ? <Lock size={18} className='text-gray-500' /> : completed ? <Unlock size={18} className="text-green-400" /> : <Unlock size={18} className='text-[#DFFF00]' />}
                </Link>
            )
        })}
        </div>
      </div>
    </div>
  );
}

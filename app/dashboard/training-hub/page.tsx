'use client';
import { useState } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, Lock, Unlock, ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function TrainingHubPage() {
  const { modules, completedModules, completeModule, isLoading } = useApplicant();
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

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

  const handleSelectModule = async (module: any) => {
    const supabase = getSupabase();
    const { data } = supabase.storage
      .from('applicant-docs')
      .getPublicUrl(module.pdf_path);
    setSelectedPdf(data.publicUrl);
    setSelectedModule(module.module_number);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-[rgb(50,60,55)] rounded-full hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
            <h2 className="text-3xl font-bold text-[#DFFF00]">Training Hub</h2>
            <p className='text-gray-400'>Continue your learning journey and unlock your full potential.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg">                
            <h3 className='text-xl font-bold mb-6 flex items-center gap-2'><GraduationCap className='text-[#DFFF00]' /> Modules</h3>
            <div className='space-y-4'>
            {modules.map(m => {
                const locked = isModuleLocked(m.module_number);
                const completed = isModuleCompleted(m.module_number);
                return (
                    <button 
                        key={m.id} 
                        onClick={() => !locked && handleSelectModule(m)} 
                        disabled={locked}
                        className={`block w-full text-left p-5 rounded-2xl flex items-center justify-between border ${locked ? 'opacity-50 cursor-not-allowed bg-white/5 border-transparent' : 'hover:bg-white/10 bg-[rgb(38,47,44)] hover:border-[#DFFF00]/50 border-white/5'} transition-all group`}
                    >
                        <span className='font-medium group-hover:text-white'>{m.title}</span>
                        {locked ? <Lock size={18} className='text-gray-500' /> : completed ? <Unlock size={18} className="text-green-400" /> : <Unlock size={18} className='text-[#DFFF00]' />}
                    </button>
                )
            })}
            </div>
            
            {selectedModule !== null && !isModuleCompleted(selectedModule) && (
                <button 
                    onClick={() => completeModule(selectedModule)} 
                    className='mt-8 w-full bg-[#DFFF00] text-[rgb(38,47,44)] p-4 rounded-xl font-bold hover:brightness-110 transition'
                >
                    Mark Module as Completed
                </button>
            )}
        </div>
        <div className="lg:col-span-7 bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg min-h-[500px] flex flex-col justify-center items-center">
            {selectedPdf ? (
                <iframe src={selectedPdf} className='w-full h-full min-h-[500px] rounded-2xl' />
            ) : (
                <div className='text-center space-y-4'>
                    <div className='bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto'>
                        <BookOpen size={48} className='text-[#DFFF00]' />
                    </div>
                    <h4 className='text-2xl font-bold'>Your learning journey starts here</h4>
                    <p className="text-gray-400 max-w-sm mx-auto">Select a module from the list on the left to begin building your skills and knowledge.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, Lock, Unlock } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

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
      .from('applicants_docs')
      .getPublicUrl(module.pdf_path);
    setSelectedPdf(data.publicUrl);
    setSelectedModule(module.module_number);
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">Training Hub</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg">                
            <h3 className='text-xl font-bold mb-4'>Modules</h3>
            <div className='space-y-3'>
            {modules.map(m => {
                const locked = isModuleLocked(m.module_number);
                const completed = isModuleCompleted(m.module_number);
                return (
                    <button 
                        key={m.id} 
                        onClick={() => !locked && handleSelectModule(m)} 
                        disabled={locked}
                        className={`block w-full text-left p-4 rounded-xl flex items-center justify-between ${locked ? 'opacity-50 cursor-not-allowed bg-white/5' : 'hover:bg-white/10 bg-[rgb(38,47,44)]'}`}
                    >
                        <span>{m.title}</span>
                        {locked ? <Lock size={16} /> : completed ? <Unlock size={16} className="text-green-400" /> : <Unlock size={16} />}
                    </button>
                )
            })}
            </div>
            
            {selectedModule !== null && !isModuleCompleted(selectedModule) && (
                <button 
                    onClick={() => completeModule(selectedModule)} 
                    className='mt-6 w-full bg-[#DFFF00] text-[rgb(38,47,44)] p-3 rounded-xl font-bold'
                >
                    I have finished studying
                </button>
            )}
        </div>
        <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg">
            {selectedPdf ? (
                <iframe src={selectedPdf} className='w-full h-96 rounded-xl' />
            ) : <p className="text-gray-400">Select an unlocked module to view</p>}
        </div>
      </div>
    </>
  );
}

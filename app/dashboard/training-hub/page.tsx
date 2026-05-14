'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getSupabase } from '@/lib/supabase';

export default function TrainingHubPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
        const supabase = getSupabase();
        // Fetch modules 1-5
        const { data } = await supabase.from('training_modules').select('*').in('id', [1,2,3,4,5]);
        if (data) setModules(data);
    }
    fetchModules();
  }, []);

  const handleFinish = async () => {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Increment stage and progress
        await supabase.rpc('increment_applicant_progress', { user_id: user.id });
        alert('Progress updated!');
    }
  }

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">Training Hub</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg">                
            <h3 className='text-xl font-bold mb-4'>Modules</h3>
            <div className='space-y-2'>
            {modules.map(m => (
                <button key={m.id} onClick={() => setSelectedPdf(m.module_url)} className='block w-full text-left p-3 rounded-lg hover:bg-white/5'>{m.title}</button>
            ))}
            </div>
            <button onClick={handleFinish} className='mt-6 w-full bg-[#DFFF00] text-[rgb(38,47,44)] p-3 rounded-xl font-bold'>I have finished</button>
        </div>
        <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg">
            {selectedPdf ? (
                <iframe src={selectedPdf} className='w-full h-96 rounded-xl' />
            ) : <p>Select a module to view</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

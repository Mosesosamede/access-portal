'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getSupabase } from '@/lib/supabase';

export default function HandbookPage() {
  const handleDownload = async () => {
    const supabase = getSupabase();
    const { data } = supabase.storage
      .from('applicant-docs')
      .getPublicUrl('Getting_Hired_.pdf');
    
    const response = await fetch(data.publicUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Getting_Hired_.pdf');
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">My Handbook</h2>
      <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg">
          <p className="mb-6">Access your main handbook here.</p>
          <button 
            onClick={handleDownload}
            className="inline-block bg-[#DFFF00] text-[rgb(38,47,44)] px-6 py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
              Download Handbook
          </button>
      </div>
    </DashboardLayout>
  );
}

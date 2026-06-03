'use client';
import { useState, useEffect } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ModulePage() {
  const { modules, completedModules, completeModule, isLoading } = useApplicant();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const params = useParams();
  const moduleNumber = parseInt(params.id as string);
  const moduleData = modules.find(m => m.module_number === moduleNumber);
  const isCompleted = completedModules.some(log => log.module_number === moduleNumber);

  useEffect(() => {
    if (moduleData) {
        const fetchPdf = async () => {
            const supabase = getSupabase();
            const { data } = supabase.storage
              .from('applicant-docs')
              .getPublicUrl(moduleData.pdf_path);
            setPdfUrl(data.publicUrl);
        };
        fetchPdf();
    }
  }, [moduleData]);

  if (isLoading || !moduleData) {
      return <div className="flex items-center justify-center h-screen"><Loader2 size={48} className="animate-spin text-[#DFFF00]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 pb-12">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/training-hub" className="p-3 bg-[rgb(50,60,55)] rounded-full hover:bg-white/10 transition flex items-center justify-center">
                  <ArrowLeft size={22} className="text-[#DFFF00]" />
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-white">{moduleData.title}</h2>
            </div>
            {!isCompleted && (
                <button 
                  onClick={() => completeModule(moduleNumber)} 
                  className='bg-[#DFFF00] text-[rgb(38,47,44)] px-6 py-3 rounded-xl font-bold hover:brightness-110 transition'
                >
                  Mark as Completed
                </button>
            )}
            {isCompleted && (
                <div className='flex items-center gap-2 text-green-400 font-semibold'>
                    <CheckCircle size={20} /> Completed
                </div>
            )}
        </div>
        
        <div className="bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-xl min-h-[600px] flex justify-center">
            {pdfUrl ? (
                <Document file={pdfUrl} loading={<Loader2 size={48} className="animate-spin text-[#DFFF00]" />}>
                  <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
                </Document>
            ) : (
                <div className="flex items-center justify-center h-[500px]">
                    <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
                </div>
            )}
        </div>
    </div>
  );
}

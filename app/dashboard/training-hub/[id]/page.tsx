'use client';
import { useState, useEffect } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, ArrowLeft, GraduationCap } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'motion/react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ModulePage() {
  const { modules, quizSubmissions, isLoading } = useApplicant();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const moduleNumber = parseInt(params.id as string);
  const moduleData = modules.find(m => m.module_number === moduleNumber);
  
  // No-review lock: check if quiz already submitted for this module
  const isQuizSubmitted = quizSubmissions.some(sub => sub.module_number === moduleNumber);

  useEffect(() => {
    if (!isLoading && isQuizSubmitted) {
      router.push('/dashboard/training-hub');
    }
  }, [isLoading, isQuizSubmitted, router]);

  useEffect(() => {
    if (moduleData) {
        const fetchPdf = async () => {
            const supabase = getSupabase();
            const path = moduleData.pdf_path.startsWith('modules/') ? moduleData.pdf_path : `modules/${moduleData.pdf_path}`;
            const { data } = supabase.storage
              .from('applicant-docs')
              .getPublicUrl(path);
            setPdfUrl(data.publicUrl);
        };
        fetchPdf();
    }
  }, [moduleData]);

  const handleFinishStudying = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`studied_module_${moduleNumber}`, 'true');
    }
    setIsExiting(true);
    setTimeout(() => {
      router.push('/dashboard/training-hub');
    }, 450);
  };

  if (isLoading || !moduleData || isQuizSubmitted) {
      return (
        <div className="flex items-center justify-center h-screen bg-[#1a2321]">
          <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
        </div>
      );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={isExiting ? { opacity: 0, y: -20, scale: 0.98 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 md:px-6 pt-8 pb-12"
    >
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/training-hub" className="p-3 bg-[rgb(50,60,55)] rounded-full hover:bg-white/10 transition flex items-center justify-center">
                  <ArrowLeft size={22} className="text-[#DFFF00]" />
                </Link>
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#DFFF00] font-mono font-semibold">Module {moduleNumber} Study</span>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">{moduleData.title}</h2>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-400 font-mono text-xs bg-[rgb(50,60,55)] px-4 py-2 rounded-xl border border-white/5">
                <GraduationCap size={16} className="text-[#DFFF00]" /> Active Study Mode
            </div>
        </div>
        
        <div className="bg-[rgb(50,60,55)] p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center">
            {pdfUrl ? (
                <div className="w-full overflow-auto max-h-[800px] rounded-2xl border border-white/5 bg-[#1a2321] p-2 flex justify-center shadow-inner">
                  <Document file={pdfUrl} loading={<Loader2 size={48} className="animate-spin text-[#DFFF00] my-24" />}>
                    <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={760} />
                  </Document>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[500px] w-full">
                    <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
                </div>
            )}

            {/* Prominent Glowing Finish Studying Button */}
            <div className="mt-8 flex justify-center w-full border-t border-white/10 pt-8">
              <button 
                onClick={handleFinishStudying} 
                className="relative group bg-[#DFFF00] text-[rgb(38,47,44)] px-10 py-5 rounded-2xl font-bold tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(223,255,0,0.2)] hover:shadow-[0_0_40px_rgba(223,255,0,0.45)] flex items-center gap-3 text-lg animate-pulse"
              >
                <span>I have finished studying Module {moduleNumber}</span>
              </button>
            </div>
        </div>
    </motion.div>
  );
}

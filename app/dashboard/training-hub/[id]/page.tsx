'use client';
import { useState, useEffect } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, ArrowLeft, GraduationCap, CheckCircle2, Play, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function ModulePage() {
  const { modules, completedModules, quizSubmissions, isLoading, completeModule, applicant } = useApplicant();
  const [isMarking, setIsMarking] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const params = useParams();
  const router = useRouter();
  
  const moduleNumber = parseInt(params.id as string);
  const moduleData = modules.find(m => m.module_number === moduleNumber);
  
  // Sequential Unlock logic: Module 1 is always unlocked; other modules are unlocked if previous is completed & submitted
  const isUnlocked = moduleNumber === 1 || quizSubmissions.some(sub => sub.module_number === moduleNumber - 1);
  
  // Progress status of the current module
  const isCompleted = completedModules.some(log => log.module_number === moduleNumber);
  const subRecord = quizSubmissions.find(sub => sub.module_number === moduleNumber);
  const hasSubmitted = !!subRecord;

  const handleMarkComplete = async () => {
    if (isMarking) return;
    setIsMarking(true);
    try {
      await completeModule(moduleNumber);
    } catch (err) {
      console.error('Error logging module completion:', err);
    } finally {
      setIsMarking(false);
    }
  };

  const handleTakeQuiz = () => {
    setIsExiting(true);
    setTimeout(() => {
      // Return to main Training Hub with a query param to auto-start the quiz
      router.push(`/dashboard/training-hub?startQuiz=${moduleNumber}`);
    }, 400);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a2321]">
        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
      </div>
    );
  }

  if (!moduleData || !applicant) {
    return (
      <div className="min-h-screen bg-[#1a2321] text-[#E0E6ED] flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Module Not Found</h3>
          <p className="text-sm text-gray-400 mb-6">We couldn&apos;t load study materials for this module.</p>
          <Link href="/dashboard/training-hub" className="bg-[#DFFF00] text-[#1a2321] px-6 py-2.5 rounded-xl font-bold transition inline-block">
            Back to Training Hub
          </Link>
        </div>
      </div>
    );
  }

  // If locked, render the locked gate view
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#1a2321] text-[#E0E6ED] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg space-y-6"
        >
          <div className="w-16 h-16 bg-red-500/10 text-red-400 mx-auto rounded-full flex items-center justify-center">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Module Locked</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              To unlock Module {moduleNumber}, you must first complete the certification quiz for Module {moduleNumber - 1}.
            </p>
          </div>
          <Link 
            href="/dashboard/training-hub" 
            className="w-full bg-[#DFFF00] text-[#1a2321] py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all block text-center"
          >
            Return to Training Hub
          </Link>
        </motion.div>
      </div>
    );
  }

  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').map((paragraph, idx) => {
      const cleanPara = paragraph.trim();
      if (!cleanPara) return null;
      
      // Basic markdown styling: check for headers or bullet items
      if (cleanPara.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-lg md:text-xl font-bold text-white mt-8 mb-4">
            {cleanPara.replace('### ', '')}
          </h4>
        );
      }
      if (cleanPara.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-xl md:text-2xl font-bold text-white mt-10 mb-5 border-b border-white/5 pb-2">
            {cleanPara.replace('## ', '')}
          </h3>
        );
      }
      if (cleanPara.startsWith('- ') || cleanPara.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside mb-6 text-gray-300 space-y-2.5 leading-relaxed text-base pl-4">
            {cleanPara.split('\n').map((item, iIdx) => (
              <li key={iIdx}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }
      
      return (
        <p key={idx} className="mb-6 text-gray-300 leading-relaxed text-base md:text-lg">
          {cleanPara.split('\n').map((line, lIdx) => (
            <span key={lIdx}>
              {line}
              {lIdx < cleanPara.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={isExiting ? { opacity: 0, y: -20, scale: 0.98 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-16"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/training-hub" className="p-3 bg-[rgb(50,60,55)] rounded-full hover:bg-white/10 transition flex items-center justify-center">
            <ArrowLeft size={22} className="text-[#DFFF00]" />
          </Link>
          <div>
            <span className="text-xs uppercase tracking-widest text-[#DFFF00] font-mono font-semibold">Module {moduleNumber} Study Space</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">{moduleData.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400 font-mono text-xs bg-[rgb(50,60,55)] px-4 py-2 rounded-xl border border-white/5 self-start sm:self-center">
          <GraduationCap size={16} className="text-[#DFFF00]" /> Dynamic Study Mode
        </div>
      </div>
      
      <div className="bg-[rgb(50,60,55)] p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col">
        {/* Module Text Content */}
        <article className="prose prose-invert max-w-none border-b border-white/10 pb-10">
          {renderContent(moduleData.content)}
        </article>

        {/* Dynamic Interactive Completion Footer Button Flow */}
        <div className="mt-10 flex flex-col items-center justify-center w-full pt-4 text-center">
          {hasSubmitted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-green-400 font-bold text-lg bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20 shadow-inner">
                <CheckCircle2 size={24} /> Module Certified & Completed! (Score: {subRecord?.score ?? 0}/5)
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                You have completed the certification quiz for this module. You can review the material as often as you like.
              </p>
              <Link 
                href="/dashboard/training-hub" 
                className="mt-2 text-[#DFFF00] hover:underline font-mono text-sm inline-block"
              >
                ← Back to Training Hub
              </Link>
            </div>
          ) : isCompleted ? (
            <div className="space-y-4 w-full max-w-md">
              <div className="text-gray-300 text-sm mb-2">
                Study logs saved! Complete the gate assessment of Module {moduleNumber} to advance.
              </div>
              <button 
                onClick={handleTakeQuiz} 
                className="w-full relative group bg-[#DFFF00] text-[rgb(38,47,44)] py-5 rounded-2xl font-extrabold tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(223,255,0,0.25)] flex items-center justify-center gap-3 text-lg animate-pulse"
              >
                <Play size={20} fill="currentColor" />
                <span>Take Quiz to Proceed</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 w-full max-w-md animate-fade-in">
              <p className="text-gray-400 text-sm">
                Ensure you read the document completely before marking.
              </p>
              <button 
                onClick={handleMarkComplete} 
                disabled={isMarking}
                className="w-full relative group bg-white/10 border border-white/20 text-white py-5 rounded-2xl font-bold tracking-wide hover:bg-white/20 hover:border-white/30 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
              >
                {isMarking ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-[#DFFF00]" />
                    <span>Synchronizing Study Log...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} className="text-[#DFFF00]" />
                    <span>Mark Module Complete</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

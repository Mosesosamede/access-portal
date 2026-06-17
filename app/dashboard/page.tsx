'use client';
import { useState, useEffect } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SiteMapTour from '@/components/layout/SiteMapTour';
import { getSupabase } from '@/lib/supabase';
import { BookOpen, Lock, Unlock, Award, Check, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { applicant, isLoading } = useApplicant();
  const router = useRouter();

  const [examSubmission, setExamSubmission] = useState<{ score: number, percentage: number } | null>(null);
  const [loadingExam, setLoadingExam] = useState(false);

  useEffect(() => {
    if (!applicant) return;
    const fetchExamScore = async () => {
      try {
        setLoadingExam(true);
        const supabase = getSupabase();
        const { data } = await supabase
          .from('professional_exam_submissions')
          .select('score, percentage')
          .eq('applicant_id', applicant.id)
          .maybeSingle();
        if (data) {
          setExamSubmission(data);
        }
      } catch (err) {
        console.error('Error loading exam details on dashboard:', err);
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExamScore();
  }, [applicant]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
      </div>
    );
  }

  if (!applicant) {
    return <div className="text-red-400">Error loading applicant data.</div>;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const STAGES = [
    'Profile Creation', 'Dashboard Access', 'Training', 'Final Exam', 'Interview', 
    'Job Pool Access', 'Engaged', 'Onboarding', '3-Month Review', '6-Month Review', 
    'Final Review', 'Testimonial', 'Completion'
  ];

  const stageInt = parseInt(applicant.current_stage) || 1;
  const isJobPoolLocked = applicant.progress_percent < 100 || stageInt <= 5;
  const progressData = [{ name: 'Progress', value: applicant.progress_percent, fill: '#DFFF00' }];

  return (
    <DashboardLayout>
      <SiteMapTour />
      <header className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[#DFFF00]">{greeting}, {applicant.full_name}</h2>
        <p className="text-gray-400 mt-2">Track your progress and access your training materials.</p>
      </header>
      
      {/* 13-Stage Progression Engine */}
      <div className="bg-[rgb(50,60,55)] p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-6">Your Journey</h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage, index) => {
                const stageNumber = index + 1;
                const activeStageInt = parseInt(applicant.current_stage) || 1;
                const isActive = stageNumber === activeStageInt;
                const isCompleted = stageNumber < activeStageInt;
                return (
                    <div key={stage} className={`flex flex-col items-center gap-2 flex-shrink-0 w-24 ${isActive ? 'text-[#DFFF00]' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-[#DFFF00]' : isCompleted ? 'border-green-400' : 'border-gray-500'}`}>
                            {stageNumber}
                        </div>
                        <span className="text-[10px] text-center font-medium leading-tight">{stage}</span>
                    </div>
                );
            })}
        </div>
      </div>

      {/* FINAL EXAM MILESTONE ALERT - STAGE 4 CARD */}
      {stageInt === 4 && (
        <div className="bg-gradient-to-r from-[#212c29] to-[#2a3834] border border-[#DFFF00]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl mb-8 relative overflow-hidden" id="dashboard-exam-callout">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#DFFF00]/5 blur-2xl rounded-full"></div>
          <div className="flex items-start gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#DFFF00]/10 border border-[#DFFF00]/20 flex items-center justify-center flex-shrink-0 text-[#DFFF00]">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                Professional Certification Exam Unlocked! <Sparkles className="w-4 h-4 text-[#DFFF00]" />
              </h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed max-w-xl">
                Your training modules are 100% complete! You are fully authorized to sit for the final <strong>75-minute assessment</strong> to unlock the next stages. Answers are autosaved instantly to the database.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/professional-exam')}
            className="w-full md:w-auto px-6 py-3.5 bg-[#DFFF00] text-[#1a2321] rounded-xl font-black text-xs hover:brightness-110 shadow-[0_0_15px_rgba(223,255,0,0.25)] transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            Start Certification Exam <ArrowRight size={14} />
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="bg-[rgb(50,60,55)] p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row items-center gap-6 justify-center md:col-span-1">
            <div className="w-28 h-28 flex-shrink-0 relative flex items-center justify-center">
                <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={progressData} startAngle={90} endAngle={-270}>
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="z-10 flex flex-col items-center justify-center">
                    {applicant.progress_percent === 100 ? (
                        <div className="relative" id="medal-complete-wrapper">
                            <Award className="w-10 h-10 text-[#DFFF00] filter drop-shadow-[0_0_12px_rgba(223,255,0,0.6)] animate-pulse" id="complete-medal-icon" />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-[#212c29]" id="complete-check-badge">
                                <Check className="w-3 h-3 text-white stroke-[3px]" />
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex flex-col items-center" id="medal-inprogress-wrapper">
                            <Award className="w-8 h-8 text-gray-400 opacity-60" id="in-progress-medal-icon" />
                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">{applicant.progress_percent}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold flex items-center gap-1.5 justify-center md:justify-start mb-1 flex-wrap"><BookOpen className="text-[#DFFF00] w-4 h-4 flex-shrink-0" /> {applicant.progress_percent}% Complete</h3>
                <p className="text-[11px] text-gray-400 text-center md:text-left leading-relaxed">You&apos;re making steady progress. Access your training modules to continue.</p>
            </div>
        </div>

        {/* Dynamic Column 2: If Exam Taken, Show Result Card; Else show Exam Locked/Inactive message */}
        {stageInt >= 5 ? (
          <div className="bg-[rgb(50,60,55)] p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between gap-4 md:col-span-1" id="dashboard-exam-outcome-badge">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="text-[#DFFF00] w-4 h-4 flex-shrink-0" /> Certification Score
              </h3>
              <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Submitted
              </span>
            </div>

            <div className="space-y-1.5 my-0.5">
              <div className="flex justify-between items-end border-b border-white/5 pb-1 text-xs">
                <span className="text-gray-400">Correct Answers:</span>
                <span className="font-bold text-white">{examSubmission?.score ?? '--'} <span className="text-[10px] text-gray-500 font-normal">/ 75</span></span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-1 text-xs">
                <span className="text-gray-400">Score Percentage:</span>
                <span className="font-bold text-[#DFFF00]">{examSubmission?.percentage ?? '--'}%</span>
              </div>
              <div className="flex justify-between items-end text-xs">
                <span className="text-gray-400">Status Eligibility:</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">ELIGIBLE</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/professional-exam')}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1.5"
            >
              Assessment Breakdown <ArrowRight size={11} />
            </button>
          </div>
        ) : (
          <div className="bg-[rgb(50,60,55)] p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-center items-center text-center gap-2.5 md:col-span-1">
            <Award className="w-8 h-8 text-gray-500" />
            <div>
              <h3 className="text-sm font-bold text-gray-300">Professional Exam</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 max-w-[180px] mx-auto leading-relaxed">
                {stageInt === 4 
                  ? 'Ready to take! Start via top banner.' 
                  : 'Complete all training modules to unlock the final certification exam.'}
              </p>
            </div>
            {stageInt === 4 && (
              <button
                onClick={() => router.push('/dashboard/professional-exam')}
                className="px-4 py-1.5 bg-[#DFFF00]/10 hover:bg-[#DFFF00]/20 text-[#DFFF00] border border-[#DFFF00]/20 text-[10px] font-bold rounded-lg transition-all"
              >
                Go to Exam Room
              </button>
            )}
          </div>
        )}

        {/* Job Pool Card */}
        <div className={`bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg flex flex-col items-center justify-center gap-4 md:col-span-1 ${isJobPoolLocked ? 'opacity-50' : ''}`}>
            {isJobPoolLocked ? <Lock size={36} className="text-gray-400" /> : <Unlock size={36} className="text-[#DFFF00]" />}
            <span className={`font-bold text-xs text-center ${isJobPoolLocked ? 'text-gray-400': 'text-[#DFFF00]'}`}>{isJobPoolLocked ? 'Job Pool Locked' : 'Job Pool Unlocked'}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}

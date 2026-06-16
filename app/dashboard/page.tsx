'use client';
import { useApplicant } from '@/components/ApplicantContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SiteMapTour from '@/components/layout/SiteMapTour';
import { BookOpen, Lock, Unlock, Award, Check } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

export default function DashboardPage() {
  const { applicant, isLoading } = useApplicant();

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
                const stageInt = parseInt(applicant.current_stage) || 1;
                const isActive = stageNumber === stageInt;
                const isCompleted = stageNumber < stageInt;
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[rgb(50,60,55)] p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row items-center gap-6">
            <div className="w-40 h-40 flex-shrink-0 relative flex items-center justify-center">
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
                            <Award className="w-12 h-12 text-[#DFFF00] filter drop-shadow-[0_0_12px_rgba(223,255,0,0.6)] animate-pulse" id="complete-medal-icon" />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-[#212c29]" id="complete-check-badge">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex flex-col items-center" id="medal-inprogress-wrapper">
                            <Award className="w-10 h-10 text-gray-400 opacity-60" id="in-progress-medal-icon" />
                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">{applicant.progress_percent}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 mb-2"><BookOpen className="text-[#DFFF00]" /> {applicant.progress_percent}% Complete</h3>
                <p className="text-gray-400">You&apos;re making steady progress. Keep going to unlock the final stages!</p>
            </div>
        </div>

        <div className={`bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg flex flex-col items-center justify-center gap-4 ${isJobPoolLocked ? 'opacity-50' : ''}`}>
            {isJobPoolLocked ? <Lock size={40} className="text-gray-400" /> : <Unlock size={40} className="text-[#DFFF00]" />}
            <span className={`font-bold text-center ${isJobPoolLocked ? 'text-gray-400': 'text-[#DFFF00]'}`}>{isJobPoolLocked ? 'Job Pool Locked' : 'Job Pool Unlocked'}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}

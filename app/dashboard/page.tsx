'use client';
import { useApplicant } from '@/components/ApplicantContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SiteMapTour from '@/components/layout/SiteMapTour';
import { AlertCircle, CheckCircle2, BookOpen, Lock, Unlock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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

  return (
    <DashboardLayout>
      <SiteMapTour />
      <h2 className="text-3xl font-bold mb-8 text-[#DFFF00]">{greeting} Back, {applicant.full_name}</h2>
      
      {/* 13-Stage Progression Engine */}
      <div className="bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-6">Your Journey</h3>
        <div className="flex justify-between items-center overflow-x-auto pb-4 gap-2">
            {STAGES.map((stage, index) => {
                const stageNumber = index + 1;
                const stageInt = parseInt(applicant.current_stage) || 1;
                const isActive = stageNumber === stageInt;
                const isCompleted = stageNumber < stageInt;
                return (
                    <div key={stage} className={`flex flex-col items-center gap-2 min-w-[100px] ${isActive ? 'text-[#DFFF00]' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-[#DFFF00]' : isCompleted ? 'border-green-400' : 'border-gray-500'}`}>
                            {stageNumber}
                        </div>
                        <span className="text-[10px] text-center font-medium">{stage}</span>
                    </div>
                );
            })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="text-[#DFFF00]" /> Training Progress</h3>
            <div className="w-full bg-[rgb(38,47,44)] rounded-full h-4 mb-2 overflow-hidden">
                <div className="bg-[#DFFF00] h-full rounded-full" style={{ width: `${applicant.progress_percent}%` }}></div>
            </div>
            <p className="text-sm text-gray-400">{applicant.progress_percent}% Complete - Keep going!</p>
        </div>

        <div className={`bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg flex items-center justify-center gap-2 ${isJobPoolLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isJobPoolLocked ? <Lock className="text-gray-400" /> : <Unlock className="text-[#DFFF00]" />}
            <span className={`font-bold ${isJobPoolLocked ? 'text-gray-400': 'text-[#DFFF00]'}`}>{isJobPoolLocked ? 'Job Pool Locked' : 'Job Pool Unlocked'}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}

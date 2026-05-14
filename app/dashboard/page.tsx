'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SiteMapTour from '@/components/layout/SiteMapTour';
import { AlertCircle, CheckCircle2, BookOpen, Clock, Lock, Unlock } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [data, setData] = useState({
    trainingProgress: 0,
    currentStage: 1,
    upcomingDeadlines: [],
    recentActivity: []
  });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const fetchData = async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: applicant } = await supabase
          .from('applicants')
          .select('training_progress, current_stage')
          .eq('auth_user_id', user.id)
          .single();
        
        if (applicant) {
          setData(prev => ({ 
            ...prev, 
            trainingProgress: applicant.training_progress,
            currentStage: applicant.current_stage || 1
          }));
        }
      }
    };
    fetchData();
  }, []);

  const STAGES = [
    'Profile Creation', 'Dashboard Access', 'Training', 'Final Exam', 'Interview', 
    'Job Pool Access', 'Engaged', 'Onboarding', '3-Month Review', '6-Month Review', 
    'Final Review', 'Testimonial', 'Completion'
  ];

  const isJobPoolLocked = data.trainingProgress < 100 || data.currentStage <= 5;

  return (
    <DashboardLayout>
      <SiteMapTour />
      <h2 className="text-3xl font-bold mb-8 text-[#DFFF00]">{greeting} Back, Candidate</h2>
      
      {/* 13-Stage Progression Engine */}
      <div className="bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-6">Your Journey</h3>
        <div className="flex justify-between items-center overflow-x-auto pb-4 gap-2">
            {STAGES.map((stage, index) => {
                const isActive = index + 1 === data.currentStage;
                const isCompleted = index + 1 < data.currentStage;
                return (
                    <div key={stage} className={`flex flex-col items-center gap-2 min-w-[100px] ${isActive ? 'text-[#DFFF00]' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-[#DFFF00]' : isCompleted ? 'border-green-400' : 'border-gray-500'}`}>
                            {index + 1}
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
                <div className="bg-[#DFFF00] h-full rounded-full" style={{ width: `${data.trainingProgress}%` }}></div>
            </div>
            <p className="text-sm text-gray-400">{data.trainingProgress}% Complete - Keep going!</p>
        </div>

        <div className={`bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg flex items-center justify-center gap-2 ${isJobPoolLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isJobPoolLocked ? <Lock className="text-gray-400" /> : <Unlock className="text-[#DFFF00]" />}
            <span className={`font-bold ${isJobPoolLocked ? 'text-gray-400': 'text-[#DFFF00]'}`}>{isJobPoolLocked ? 'Job Pool Locked' : 'Job Pool Unlocked'}</span>
        </div>

        <div className="lg:col-span-3 bg-[rgb(50,60,55)] p-6 rounded-3xl border border-white/10 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {data.recentActivity.length === 0 && <p className="text-sm text-gray-400">No recent activity.</p>}
                {data.recentActivity.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-[rgb(38,47,44)] p-4 rounded-xl border border-white/5">
                        {item.type === 'completed' ? <CheckCircle2 className="text-green-400" /> : <AlertCircle className="text-yellow-400" />}
                        <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

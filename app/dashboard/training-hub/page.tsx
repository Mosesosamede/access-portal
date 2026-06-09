'use client';
import { useState, useEffect } from 'react';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, Lock, Unlock, ArrowLeft, BookOpen, GraduationCap, CheckCircle, Clock, Award, AlertTriangle, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

const FALLBACK_QUIZ_QUESTIONS: Record<number, any[]> = {
  1: [
    {
      question_text: "What is the most effective way to build a strong professional network?",
      options: [
        "Spamming LinkedIn connections with generic templates",
        "Attending networking events and engaging in authentic conversation",
        "Only talking to the most senior executives in your field",
        "Waiting for people to find you on search engines"
      ],
      correct_index: 1
    },
    {
      question_text: "When crafting a professional resume, which of the following is most crucial?",
      options: [
        "Listing every hobby and personal interest since childhood",
        "Using flashy colorful diagrams and high-contrast personal logos",
        "Tailoring your bullet points to match the target job description with metrics",
        "Making the document as long as possible to show expertise"
      ],
      correct_index: 2
    },
    {
      question_text: "What is the purpose of a professional cover letter?",
      options: [
        "To repeat the entire resume word-for-word in paragraph form",
        "To outline salary negotiations and list desired perks in detail",
        "To tell a compelling story matching your skills with the company's needs",
        "To explain why your previous employers were completely wrong"
      ],
      correct_index: 2
    },
    {
      question_text: "Which of the following defines 'Career Growth'?",
      options: [
        "Getting promoted solely based on length of tenure",
        "Continuous learning, skill acquisition, and expanding scope of influence",
        "Demanding salary increases every six months without fail",
        "Changing jobs as frequently as possible to increase title rank"
      ],
      correct_index: 1
    },
    {
      question_text: "What does 'active client research' involve before an interview?",
      options: [
        "Quickly scanning the homepage 5 minutes before the call starts",
        "Memorizing the names of every board member from their public wiki",
        "Understanding their industry, core products, target audience, and current challenges",
        "Sending a message to the HR manager asking what they do"
      ],
      correct_index: 2
    }
  ],
  2: [
    {
      question_text: "In professional communication, 'emotional intelligence' translates to which of the following?",
      options: [
        "Sharing emotional personal stories to build rapport",
        "Recognizing, understanding, and managing emotions to communicate constructively",
        "Always agreeing with the loudest person in the conference room",
        "Avoiding any stressful situations or tight deadlines"
      ],
      correct_index: 1
    },
    {
      question_text: "What is the best practice when you realize a major project milestone will be missed?",
      options: [
        "Hope standard project variance hides it until next quarter",
        "Working 24 hours straight without informing the project manager",
        "Proactively notifying stakeholders with a clear explanation and updated plan",
        "Assigning blame to external factors or junior engineers"
      ],
      correct_index: 2
    },
    {
      question_text: "How should constructive criticism from a team lead be handled?",
      options: [
        "Take it personally and update your resume immediately",
        "Defend your work by pointing out flaws in other colleagues' work",
        "Active listening, requesting specific examples, and designing a development plan",
        "Nodding in agreement during the review but changing absolutely nothing"
      ],
      correct_index: 2
    },
    {
      question_text: "What is the hallmark of 'Ownership' in the workplace?",
      options: [
        "Keeping your tasks strictly isolated and refusing to help others",
        "Taking responsibility for outcomes, proactively solving blockers, and driving results",
        "Seeking public credit for every successful team milestone",
        "Dictating instructions to colleagues without doing hands-on work"
      ],
      correct_index: 1
    },
    {
      question_text: "Which of the following is considered positive workplace etiquette?",
      options: [
        "Arriving exactly on time but staying silent during all discussions",
        "Keeping your webcam turned off during all internal meetings",
        "Punctuality, structured collaboration, active listening, and respecting diverse views",
        "Replying to team chats only during scheduled weekly reviews"
      ],
      correct_index: 2
    }
  ],
  3: [
    {
      question_text: "Under the Eisenhower Matrix, what is the best strategy for tasks that are 'Urgent but Not Important'?",
      options: [
        "Do them immediately ahead of all deep work",
        "Delegate them to appropriate team members or automate them",
        "Schedule them for next quarter's personal sprint",
        "Delete them from your action log entirely"
      ],
      correct_index: 1
    },
    {
      question_text: "Which of the following is the core benefit of the Pomodoro Technique?",
      options: [
        "To make meetings shorter and more efficient",
        "Sustained focus and mental stamina through rhythmic, timed intervals",
        "Maximizing the absolute number of hours spent at your desk",
        "Standardizing project deliverables across diverse engineering teams"
      ],
      correct_index: 1
    },
    {
      question_text: "What role does 'Deep Work' play in modern information professions?",
      options: [
        "Spending hours cleaning up your professional inbox",
        "Rapidly multitasking across 5 distinct digital channels",
        "High-concentration cognitive activities that create massive value and skill growth",
        "Collaborating with team members on shared boards"
      ],
      correct_index: 2
    },
    {
      question_text: "How can tool automation most effectively boost individual productivity?",
      options: [
        "Moving responsibility entirely away from the quality assurance team",
        "Eliminating repetitive tasks to unlock time for creative and strategic work",
        "Replacing the need for active peer feedback loops",
        "Standardizing every single word in all client emails"
      ],
      correct_index: 1
    },
    {
      question_text: "What is the root cause of professional burnout according to productivity studies?",
      options: [
        "Having a high-density, highly disciplined daily routine",
        "Mismatch in workload, lack of control, insufficient reward, and poor boundaries",
        "Working on projects that challenge your core technical boundaries",
        "Attending more than two engineering cross-functional syncs per day"
      ],
      correct_index: 1
    }
  ],
  4: [
    {
      question_text: "What does sound cybersecurity hygiene require for enterprise accounts?",
      options: [
        "Reusing the same secure password with simple suffix variants",
        "Storing active account access keys on secured shared public sheets",
        "High-entropy unique passwords, multi-factor authentication (MFA), and zero share",
        "Changing passwords exactly once per year"
      ],
      correct_index: 2
    },
    {
      question_text: "In modern documentation systems, what is the best practice for version control?",
      options: [
        "Appending date codes to target file names (e.g., Draft_v4_Final)",
        "Using cloud systems with automated revisions, single source of truth, and change logs",
        "Sending revised documents to team leads via immediate email attachments",
        "Re-creating the document folder structure for every minor sprint cycle"
      ],
      correct_index: 1
    },
    {
      question_text: "What is the primary role of 'Generative AI' in an analyst's daily workflow?",
      options: [
        "Generating final reports to copy-paste directly without professional review",
        "Replacing the human evaluation stage entirely for fast-tracking",
        "Partnering as an accelerant for drafting, brainstorming, and initial coding",
        "Substituting for customer research interviews"
      ],
      correct_index: 2
    },
    {
      question_text: "When analyzing a large dataset, which practice ensures data integrity?",
      options: [
        "Deleting outlier data points that conflict with desired project outcomes",
        "Double-counting missing responses as the statistical average",
        "Structuring precise data validation rules, treating nulls clearly, and documenting methods",
        "Selecting only the records that confirm existing hypotheses"
      ],
      correct_index: 2
    },
    {
      question_text: "What is the main utility of using cloud-based collaborative whiteboards?",
      options: [
        "To replace all text documentation and spreadsheets",
        "Rhythmic asynchronous brainstorming, wireframing, and real-time visual collaboration",
        "Presenting high-fidelity mockups to passive client audiences",
        "Conducting complex calculations and financial projections"
      ],
      correct_index: 1
    }
  ],
  5: [
    {
      question_text: "How can an intern make the most positive first impression during their first week?",
      options: [
        "Offering strategic company overhauls to the executive team on day two",
        "Staying entirely silent and avoiding conversation until assigned specific work",
        "Active curiosity, punctuality, taking copious notes, and clarifying expectations",
        "Asking for flexible work hours and remote options immediately"
      ],
      correct_index: 2
    },
    {
      question_text: "What is the most constructive way to seek clarification on a task assignment?",
      options: [
        "Waiting until the task is due to explain that you did not understand",
        "Paraphrasing expectations, documenting key deliverables, and scheduling an alignment brief",
        "Asking colleagues to do the work with you so you can shadow them",
        "Initiating the task with multiple assumptions without verifying with the manager"
      ],
      correct_index: 1
    },
    {
      question_text: "Which behavior differentiates a high-performing intern from a standard one?",
      options: [
        "Completing only assigned tasks and resting for the remaining day",
        "Proactively identifying problems, suggesting solutions, and demonstrating eagerness",
        "Working late hours to ensure visibility even when work is already done",
        "Telling management how much harder you work than other interns"
      ],
      correct_index: 1
    },
    {
      question_text: "What does 'managing up' mean for an intern?",
      options: [
        "Instructing your manager on how they should coordinate team tasks",
        "Giving direct feedback to department heads on leadership style",
        "Ensuring your manager stays informed of your progress, blockers, and bandwidth",
        "Bypassing your manager to talk to directors because you have high energy"
      ],
      correct_index: 2
    },
    {
      question_text: "What is the ultimate goal of an internship from a career development perspective?",
      options: [
        "To secure a permanent professional contract through demonstrated value and talent",
        "To collect a letter of recommendation without participating in company culture",
        "To gain maximum visual branding on social media channels",
        "To observe daily operations without participating in actual deliverables"
      ],
      correct_index: 0
    }
  ]
};

export default function TrainingHubPage() {
  const { modules, quizSubmissions, submitQuiz, isLoading } = useApplicant();

  // Active Quiz State
  const [activeQuizModule, setActiveQuizModule] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(180);
  const [isQuizFinishedLocally, setIsQuizFinishedLocally] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEvaluatedQuiz = async (overrideModule?: number, overrideAnswers?: any, overrideQuestions?: any) => {
    const activeModule = overrideModule ?? activeQuizModule;
    if (activeModule === null || isSubmitting) return;
    setIsSubmitting(true);

    const answers = overrideAnswers ?? selectedAnswers;
    const questions = overrideQuestions ?? quizQuestions;

    // Calculate score
    let scoreCount = 0;
    questions.forEach((q: any, idx: number) => {
      const chosen = answers[idx];
      if (chosen !== undefined && chosen === q.correct_index) {
        scoreCount++;
      }
    });

    setLocalScore(scoreCount);
    
    try {
      await submitQuiz(activeModule, scoreCount);
      sessionStorage.removeItem(`quiz_start_time_m${activeModule}`);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`studied_module_${activeModule}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setIsQuizFinishedLocally(true);
    }
  };

  const handleAutoSubmit = (overrideModule: number, overrideAnswers: any, overrideQuestions: any) => {
    submitEvaluatedQuiz(overrideModule, overrideAnswers, overrideQuestions);
  };

  const handleManualSubmit = () => {
    submitEvaluatedQuiz();
  };

  // Before unload block when quiz is running
  useEffect(() => {
    if (activeQuizModule !== null) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to exit? Your progress on this quiz will be lost.';
        return e.returnValue;
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [activeQuizModule]);

  // Quiz Timer effect with Resume persistence
  useEffect(() => {
    if (activeQuizModule === null) return;

    const tick = () => {
      const now = Date.now();
      const storedStartTime = sessionStorage.getItem(`quiz_start_time_m${activeQuizModule}`);
      let startTime = now;
      
      if (storedStartTime) {
        startTime = parseInt(storedStartTime, 10);
      } else {
        sessionStorage.setItem(`quiz_start_time_m${activeQuizModule}`, now.toString());
      }

      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, 180 - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleAutoSubmit(activeQuizModule, selectedAnswers, quizQuestions);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuizModule, quizQuestions, selectedAnswers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
      </div>
    );
  }

  // Circular Stats Calculations
  const totalQuizPointsPossible = 25;
  const quizPointsEarned = quizSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
  const currentCompletionPercent = Math.round((quizSubmissions.length / 5) * 100);

  const isModuleCompleted = (moduleNumber: number) => {
    return quizSubmissions.some(sub => sub.module_number === moduleNumber);
  };

  const isModuleLocked = (moduleNumber: number) => {
    if (moduleNumber === 1) return false;
    // Locked if previous module hasn't been submitted
    return !quizSubmissions.some(sub => sub.module_number === moduleNumber - 1);
  };

  const hasStudiedModule = (moduleNumber: number) => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(`studied_module_${moduleNumber}`) === 'true';
  };

  const handleStartQuiz = async (moduleNumber: number) => {
    setActiveQuizModule(moduleNumber);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsQuizFinishedLocally(false);
    setTimeLeft(180);

    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('module_number', moduleNumber);
      
      if (data && data.length >= 5) {
        setQuizQuestions(data.slice(0, 5));
      } else {
        setQuizQuestions(FALLBACK_QUIZ_QUESTIONS[moduleNumber] || []);
      }
    } catch {
      setQuizQuestions(FALLBACK_QUIZ_QUESTIONS[moduleNumber] || []);
    }
  };

  const closeQuizOverlay = () => {
    setActiveQuizModule(null);
    setQuizQuestions([]);
    setIsQuizFinishedLocally(false);
  };

  // Circular Stats calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentCompletionPercent / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-12">
      
      {/* Header and top-right widget block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-[#dbf0de]/10 pb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 bg-[#26312f] rounded-full hover:bg-[#dbf0de]/10 transition flex items-center justify-center text-[#dbf0de]">
            <ArrowLeft size={22} className="text-[#DFFF00]" />
          </Link>
          <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Training Hub</h2>
              <p className='text-gray-400 mt-1 max-w-md'>Complete the study materials and challenge the module gates to advance.</p>
          </div>
        </div>

        {/* Dashboard Widget Header Stats (Top Right) */}
        <div className="bg-[#26312f] p-4 rounded-3xl border border-white/10 shadow-lg flex items-center gap-5 justify-between md:justify-end min-w-[280px]">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-semibold">Training Stats</div>
            <div className="text-sm font-bold text-white">Points: <span className="text-[#DFFF00] font-mono">{quizPointsEarned}</span> / 25</div>
            <div className="text-xs text-gray-300">Total Score: <span className="font-mono">{quizPointsEarned}</span> pts</div>
            <div className="text-xs text-[#DFFF00] font-semibold">Completion: <span className="font-mono">{currentCompletionPercent}</span>%</div>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r={radius} className="text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" />
              <circle 
                cx="32" 
                cy="32" 
                r={radius} 
                className="text-[#DFFF00]" 
                strokeWidth="6" 
                stroke="currentColor" 
                fill="transparent" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#DFFF00]">
              {currentCompletionPercent}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Modules List layout */}
      <div className='bg-[#26312f] p-6 md:p-8 rounded-3xl border border-[#dbf0de]/10 shadow-xl'>
        <h3 className='text-xl font-bold mb-8 flex items-center gap-3 text-white'><GraduationCap className='text-[#dbf0de]' /> Course Modules</h3>
        
        <div className='space-y-6'>
        {modules.map(m => {
            const completed = isModuleCompleted(m.module_number);
            const locked = isModuleLocked(m.module_number);
            const studied = hasStudiedModule(m.module_number);
            const activeModuleNumber = quizSubmissions.length + 1;
            const isCurrentActive = m.module_number === activeModuleNumber;

            return (
              <div 
                key={m.id}
                className={`p-6 rounded-2xl border transition-all ${
                  completed 
                    ? 'bg-[#1a2321]/40 border-green-500/10 opacity-90' 
                    : locked 
                    ? 'opacity-40 bg-[#1a2321]/30 border-transparent pointer-events-none'
                    : 'bg-[#1a2321] border-[#dbf0de]/10 hover:border-[#dbf0de]/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left block Info */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${completed ? 'bg-green-500/10 text-green-400' : locked ? 'bg-white/5 text-gray-500' : 'bg-[#DFFF00]/10 text-[#DFFF00]'}`}>
                      {completed ? <CheckCircle size={22} /> : locked ? <Lock size={22} /> : <BookOpen size={22} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Module {m.module_number}</span>
                        {completed && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-green-500/10 text-green-400 font-bold border border-green-400/20">COMPLETED</span>
                        )}
                        {isCurrentActive && !completed && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#DFFF00]/10 text-[#DFFF00] font-bold border border-[#DFFF00]/30 animate-pulse">ACTIVE STEP</span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1">{m.title}</h4>
                    </div>
                  </div>

                  {/* Right block Actions (No review rule applies) */}
                  <div className="flex flex-wrap items-center gap-3">
                    {completed ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-bold bg-green-500/[0.08] px-4 py-2.5 rounded-xl border border-green-500/20">
                        <Check size={16} /> Module Completed
                      </div>
                    ) : locked ? (
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                        <Lock size={14} /> Locked Gate
                      </div>
                    ) : studied && isCurrentActive ? (
                      <button 
                        onClick={() => handleStartQuiz(m.module_number)}
                        className="bg-[#DFFF00] text-[#1a2321] px-5 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all text-sm font-sans flex items-center gap-2 shadow-[0_0_15px_rgba(223,255,0,0.2)] animate-bounce"
                      >
                        Take Quiz to Proceed <ChevronRight size={16} />
                      </button>
                    ) : (
                      <Link 
                        href={`/dashboard/training-hub/${m.module_number}`}
                        className="bg-[#26312f] text-[#DFFF00] border border-[#DFFF00]/20 hover:border-[#DFFF00] px-5 py-2.5 rounded-xl font-bold active:scale-95 transition-all text-sm flex items-center gap-2"
                      >
                        Study Module <BookOpen size={16} />
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            )
        })}
        </div>
      </div>

      {/* FULL-SCREEN QUIZ ENGINE OVERLAY */}
      <AnimatePresence>
        {activeQuizModule !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f1413] z-[100] flex flex-col justify-between"
          >
            {/* Top Stats Bar */}
            <header className="border-b border-white/10 bg-[#161f1e] p-4 flex justify-between items-center px-6 md:px-12">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">Module {activeQuizModule} Certification Gate</span>
                <h3 className="text-base md:text-lg font-bold text-white mt-0.5">Assessing Key Competencies</h3>
              </div>
              
              {/* 3-Minute Guard Timer */}
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border font-mono text-sm md:text-base font-bold transition-all ${
                timeLeft < 30 
                  ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
                  : 'bg-[#26312f]/80 text-[#DFFF00] border-[#DFFF00]/20'
              }`}>
                <Clock size={16} className={`${timeLeft < 30 ? 'text-red-500 animate-spin' : 'text-[#DFFF00]'}`} />
                <span>{Math.floor(timeLeft / 60)}:{((timeLeft % 60).toString().padStart(2, '0'))}</span>
              </div>
            </header>

            {/* Main Interactive Quiz Card Container */}
            <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 max-w-3xl mx-auto w-full flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!isQuizFinishedLocally ? (
                  <motion.div 
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    {/* Progress indicator */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                        <span>QUESTION {currentQuestionIndex + 1} OF 5</span>
                        <span>{Math.round(((currentQuestionIndex + 1) / 5) * 100)}% Complete</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#DFFF00] h-full transition-all duration-300" 
                          style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question text */}
                    {quizQuestions[currentQuestionIndex] && (
                      <div className="space-y-6">
                        <h4 className="text-xl md:text-2xl font-bold font-sans text-white leading-snug">
                          {quizQuestions[currentQuestionIndex].question_text}
                        </h4>

                        {/* Large Tappable Options list */}
                        <div className="space-y-3 pt-2">
                          {quizQuestions[currentQuestionIndex].options.map((opt: string, optIndex: number) => {
                            const isChosen = selectedAnswers[currentQuestionIndex] === optIndex;
                            return (
                              <button
                                key={optIndex}
                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: optIndex }))}
                                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.99] duration-155 ${
                                  isChosen
                                    ? 'bg-[#DFFF00]/10 border-[#DFFF00] text-white shadow-[0_0_20px_rgba(223,255,0,0.12)]'
                                    : 'bg-[#1c2624] border-white/5 hover:border-white/20 hover:bg-[#26312f]/50 text-gray-300'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-mono font-bold text-sm transition-all ${
                                  isChosen ? 'bg-[#DFFF00] text-[#1a2321]' : 'bg-white/5 text-gray-400'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}
                                </div>
                                <span className="font-semibold text-sm md:text-base leading-relaxed">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  // Results Success Modal Inside Locked Screen
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#1c2624] border border-white/10 p-8 md:p-12 rounded-3xl text-center space-y-6 max-w-md mx-auto shadow-2xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 mx-auto flex items-center justify-center">
                      <Award size={36} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-bold text-white">Quiz Evaluation Finished</h4>
                      <p className="text-gray-400 text-sm">Your answers have been synchronized atomic with the course database.</p>
                    </div>

                    <div className="bg-[#151c1b] p-6 rounded-2xl border border-white/5 space-y-2.5">
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Module Score Summary</div>
                      <div className="text-3xl font-black text-[#DFFF00] font-mono">{localScore} / 5</div>
                      <p className="text-xs text-gray-300 font-mono">Points Earned: +{localScore} pts</p>
                      <p className="text-xs text-green-400 font-semibold">+20% Completion Milestone Met</p>
                    </div>

                    <button
                      onClick={closeQuizOverlay}
                      className="w-full bg-[#DFFF00] text-[#1a2321] py-4 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(223,255,0,0.15)] text-base"
                    >
                      Acknowledge & Continue
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Navigation and Submission Bottom Footer Panel */}
            {!isQuizFinishedLocally && (
              <footer className="border-t border-white/10 bg-[#161f1e] p-4 flex justify-between items-center px-6 md:px-12 shrink-0">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm shrink-0"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {currentQuestionIndex < 4 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-[#26312f] text-white hover:bg-white/5 transition-all text-sm shrink-0"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#DFFF00] text-[#1a2321] hover:brightness-110 disabled:opacity-50 transition-all text-sm shrink-0 shadow-[0_0_15px_rgba(223,255,0,0.2)]"
                  >
                    {isSubmitting ? (
                      <>Evaluating... <Loader2 size={16} className="animate-spin" /></>
                    ) : (
                      <>Submit Evaluation <Check size={16} /></>
                    )}
                  </button>
                )}
              </footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

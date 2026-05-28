'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Key, LogIn, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.15,
        ease: "easeOut"
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-[#1a2321] text-[#dbf0de] relative overflow-hidden py-10 sm:py-16 md:py-20">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl flex flex-col items-center"
      >
        {/* Upper Brand Badge */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbf0de]/5 border border-[#dbf0de]/10 mb-5 sm:mb-6 backdrop-blur-sm"
        >
          <Sparkles size={12} className="text-[#dbf0de]" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-[#dbf0de]">Deloxe Consulting Group</span>
        </motion.div>

        {/* Logo & Headline */}
        <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <div className="relative mb-3 sm:mb-4 group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#dbf0de] to-green-400 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <Image 
              src="https://i.ibb.co/pjxqNW0p/favicon.png" 
              alt="Deloxe HR Logo" 
              width={76} 
              height={76} 
              className="relative rounded-full border border-[#dbf0de]/10 sm:w-[84px] sm:h-[84px]" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            Deloxe <span className="text-[#dbf0de]">HR Ecosystem</span>
          </h1>
          <p className="text-[#dbf0de]/70 text-xs sm:text-sm md:text-base max-w-md mx-auto px-2">
            A premium portal for career acceleration and skills empowerment.
          </p>
        </motion.div>

        {/* Key Information Panel */}
        <motion.div 
          variants={itemVariants}
          className="w-full bg-[#dbf0de]/5 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-[#dbf0de]/10 backdrop-blur-lg shadow-2xl mb-5 sm:mb-6 relative overflow-hidden"
        >
          {/* Subtle Decorative Gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#dbf0de] rounded-full filter blur-[80px] opacity-10 pointer-events-none"></div>
          
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <div className="p-2 sm:p-3 bg-[#dbf0de]/10 rounded-xl sm:rounded-2xl border border-[#dbf0de]/10">
              <BookOpen size={20} className="text-[#dbf0de] sm:w-[24px] sm:h-[24px]" />
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white">Get Hired Handbook Portal</h3>
              <p className="text-xs sm:text-sm text-[#dbf0de]/80 leading-relaxed max-w-sm">
                Unlock training modules, tests, and active job placements by securing the handbook. Registrations require your unique handbook access code.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Pathways */}
        <motion.div 
          variants={itemVariants} 
          className="w-full flex flex-col gap-3 sm:gap-4"
        >
          {/* 1. Onboarding Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Purchase Handbook */}
            <Link 
              href="/sales" 
              className="group flex flex-col justify-between p-4 sm:p-5 bg-[#dbf0de] text-[#1a2321] rounded-xl sm:rounded-2xl font-bold transition duration-300 hover:shadow-[0_0_20px_rgba(219,240,222,0.3)] hover:-translate-y-0.5"
              id="btn-get-handbook"
            >
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#1a2321]/60 block mb-0.5 sm:mb-1">Step 1</span>
                <span className="text-base sm:text-lg md:text-xl font-extrabold">Get Handbook</span>
              </div>
              <div className="flex items-center justify-between mt-4 sm:mt-6 pt-2 border-t border-[#1a2321]/10">
                <span className="text-xs font-semibold">Buy Copy & Get Code</span>
                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform sm:w-[16px] sm:h-[16px]" />
              </div>
            </Link>

            {/* Redeem Access Code */}
            <Link 
              href="/access" 
              className="group flex flex-col justify-between p-4 sm:p-5 bg-[#dbf0de]/5 border border-[#dbf0de]/10 hover:border-[#dbf0de]/20 rounded-xl sm:rounded-2xl text-white transition duration-300 hover:bg-[#dbf0de]/10 hover:-translate-y-0.5"
              id="btn-redeem-code"
            >
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#dbf0de]/60 block mb-0.5 sm:mb-1">Step 2</span>
                <span className="text-base sm:text-lg md:text-xl font-extrabold">Start Journey</span>
              </div>
              <div className="flex items-center justify-between mt-4 sm:mt-6 pt-2 border-t border-[#dbf0de]/10">
                <span className="text-xs font-semibold text-[#dbf0de]/60">Use Access Code</span>
                <Key size={14} className="text-[#dbf0de] transform group-hover:translate-x-1 transition-transform sm:w-[16px] sm:h-[16px]" />
              </div>
            </Link>
          </div>

          {/* 2. Secondary Portal Link */}
          <Link 
            href="/login" 
            className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-[#dbf0de]/5 border border-[#dbf0de]/10 hover:bg-[#1a2321] transition duration-300 group"
            id="btn-login"
          >
            <div className="flex items-center gap-3">
              <LogIn size={16} className="text-[#dbf0de]/60 group-hover:text-[#dbf0de] transition-colors sm:w-[18px] sm:h-[18px]" />
              <div className="text-left">
                <span className="text-[10px] text-[#dbf0de]/60 block">Already Registered?</span>
                <span className="text-xs sm:text-sm font-semibold text-white">Sign In to Your Workspace</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#dbf0de]/60 group-hover:text-white transform group-hover:translate-x-1 transition-all sm:w-[18px] sm:h-[18px]" />
          </Link>
        </motion.div>

        {/* Footer info lockup */}
        <motion.p 
          variants={itemVariants}
          className="text-[10px] text-[#dbf0de]/40 mt-8 sm:mt-12 text-center select-none"
        >
          Secured with Deloxe Professional Services &copy; {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </main>
  );
}


'use client';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2 } from 'lucide-react';

export default function SkillsPage() {
  const { applicant, isLoading } = useApplicant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
      </div>
    );
  }

  if (!applicant) return <div className="text-red-400">Error loading data.</div>;

  let skillsArray: string[] = [];
  if (Array.isArray(applicant.skills)) {
      skillsArray = applicant.skills;
  } else if (typeof applicant.skills === 'string') {
      try {
          const parsed = JSON.parse(applicant.skills);
          if (Array.isArray(parsed)) {
              skillsArray = parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
              skillsArray = Object.values(parsed).map(String);
          }
      } catch (e) {
          console.error("Failed to parse skills:", e);
          skillsArray = [];
      }
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">Skills</h2>
      <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4">Core Skills</h3>
            <div className="flex flex-wrap gap-2">
                {skillsArray.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-[#DFFF00] text-[rgb(38,47,44)] rounded-full font-bold text-sm">
                        {String(skill || '')}
                    </span>
                ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-bold mb-4">Competitive Edge</h3>
            <p className="text-gray-300">{applicant.competitive_edge || 'No competitive edge provided.'}</p>
          </div>
      </div>
    </>
  );
}

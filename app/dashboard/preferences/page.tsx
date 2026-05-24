'use client';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2 } from 'lucide-react';

export default function PreferencesPage() {
  const { applicant, isLoading } = useApplicant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={48} className="animate-spin text-[#DFFF00]" />
      </div>
    );
  }

  if (!applicant) return <div className="text-red-400">Error loading data.</div>;

  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">Preferences</h2>
      <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-gray-400 text-sm">Preferred Industry</p><p>{applicant.preferred_industry}</p></div>
              <div><p className="text-gray-400 text-sm">Preferred Role</p><p>{applicant.preferred_role}</p></div>
              <div><p className="text-gray-400 text-sm">Preferred Location</p><p>{applicant.preferred_location}</p></div>
          </div>
      </div>
    </>
  );
}

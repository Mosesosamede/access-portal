'use client';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="p-2 bg-[rgb(50,60,55)] rounded-full hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-3xl font-bold text-[#DFFF00]">Profile</h2>
      </div>
      
      <div className="bg-[rgb(50,60,55)] p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {applicant.passport_photo_url && (
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-[#DFFF00]">
                      <Image src={applicant.passport_photo_url} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
              )}
              <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">{applicant.full_name}</h3>
                  <p className="text-gray-400">{applicant.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300 border border-white/10">{applicant.status_tag}</span>
              </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
              <h4 className="font-bold mb-6 text-lg">Personal Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DetailItem label="Gender" value={applicant.gender} />
                  <DetailItem label="Date of Birth" value={new Date(applicant.date_of_birth).toLocaleDateString()} />
                  <DetailItem label="Institution" value={applicant.institution_name} />
                  <DetailItem label="Course of Study" value={applicant.course_of_study} />
                  <DetailItem label="Degree" value={applicant.degree} />
                  <DetailItem label="Graduation Year" value={applicant.graduation_year.toString()} />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <DetailItem label="Residential Address" value={applicant.residential_address} />
                  </div>
              </div>
          </div>

          <div className="border-t border-white/10 pt-8">
              <h4 className="font-bold mb-6 text-lg">Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {applicant.cv_resume_url && <DocLink href={applicant.cv_resume_url} label="CV / Resume" />}
                  {applicant.educational_cert_url && <DocLink href={applicant.educational_cert_url} label="Education Certificate" />}
                  {applicant.nysc_cert_url && <DocLink href={applicant.nysc_cert_url} label="NYSC Certificate" />}
              </div>
          </div>
      </div>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[rgb(38,47,44)] p-4 rounded-xl border border-white/5">
            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{label}</p>
            <p className="font-semibold text-sm">{value}</p>
        </div>
    )
}

function DocLink({ href, label }: { href: string; label: string }) {
    return (
        <a href={href} target="_blank" className="flex items-center justify-between p-4 bg-[rgb(38,47,44)] rounded-xl border border-white/5 hover:border-[#DFFF00] transition group">
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-[#DFFF00] text-xs font-bold group-hover:underline">View</span>
        </a>
    )
}


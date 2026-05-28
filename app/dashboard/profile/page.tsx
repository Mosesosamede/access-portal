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
    <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-3 bg-[#26312f] rounded-full hover:bg-[#dbf0de]/10 transition flex items-center justify-center text-[#dbf0de]">
          <ArrowLeft size={22} className="text-[#dbf0de]" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-white">Profile</h2>
      </div>
      
      <div className="bg-[#26312f] p-6 md:p-10 rounded-3xl border border-[#dbf0de]/10 shadow-xl space-y-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {applicant.passport_photo_url && (
                  <div className="relative w-36 h-36 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-[#dbf0de]/20">
                      <Image src={applicant.passport_photo_url} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
              )}
              <div className="text-center sm:text-left flex flex-col gap-2">
                  <h3 className="text-3xl font-bold text-white">{applicant.full_name}</h3>
                  <p className="text-gray-400 font-medium">{applicant.email}</p>
                  <span className="inline-block mt-1 px-4 py-1.5 rounded-full bg-[#dbf0de]/10 text-xs font-semibold text-[#dbf0de] border border-[#dbf0de]/20">
                    {applicant.status_tag}
                  </span>
              </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
              <h4 className="font-bold mb-6 text-xl text-white">Personal Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DetailItem label="Gender" value={applicant.gender} />
                  <DetailItem label="Date of Birth" value={new Date(applicant.date_of_birth).toLocaleDateString()} />
                  <DetailItem label="Institution" value={applicant.institution_name} />
                  <DetailItem label="Course of Study" value={applicant.course_of_study} />
                  <DetailItem label="Degree" value={applicant.degree} />
                  <DetailItem label="Graduation Year" value={applicant.graduation_year.toString()} />
                  <div className="sm:col-span-2">
                    <DetailItem label="Residential Address" value={applicant.residential_address} />
                  </div>
              </div>
          </div>

          <div className="border-t border-white/10 pt-8">
              <h4 className="font-bold mb-6 text-xl text-white">Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applicant.cv_resume_url && <DocLink href={applicant.cv_resume_url} label="CV / Resume" />}
                  {applicant.educational_cert_url && <DocLink href={applicant.educational_cert_url} label="Education Certificate" />}
                  {applicant.nysc_cert_url && <DocLink href={applicant.nysc_cert_url} label="NYSC Certificate" />}
              </div>
          </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#1a2321] p-4 rounded-xl border border-[#dbf0de]/5">
            <p className="text-[#dbf0de]/60 text-xs mb-1 uppercase tracking-wider">{label}</p>
            <p className="font-semibold text-sm text-white">{value}</p>
        </div>
    )
}

function DocLink({ href, label }: { href: string; label: string }) {
    return (
        <a href={href} target="_blank" className="flex items-center justify-between p-4 bg-[#1a2321] rounded-xl border border-[#dbf0de]/5 hover:border-[#dbf0de] transition group">
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-[#dbf0de] text-xs font-bold group-hover:underline">View</span>
        </a>
    )
}


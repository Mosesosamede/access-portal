'use client';
import { useApplicant } from '@/components/ApplicantContext';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

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
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">Profile</h2>
      <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg space-y-6">
          <div className="flex items-center gap-6">
              {applicant.passport_photo_url && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#DFFF00]">
                      <Image src={applicant.passport_photo_url} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
              )}
              <div>
                  <h3 className="text-2xl font-bold">{applicant.full_name}</h3>
                  <p className="text-gray-400">{applicant.email}</p>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-gray-400 text-sm">Gender</p><p>{applicant.gender}</p></div>
              <div><p className="text-gray-400 text-sm">Date of Birth</p><p>{new Date(applicant.date_of_birth).toLocaleDateString()}</p></div>
              <div><p className="text-gray-400 text-sm">Institution</p><p>{applicant.institution_name}</p></div>
              <div><p className="text-gray-400 text-sm">Course of Study</p><p>{applicant.course_of_study}</p></div>
              <div><p className="text-gray-400 text-sm">Degree</p><p>{applicant.degree}</p></div>
              <div><p className="text-gray-400 text-sm">Graduation Year</p><p>{applicant.graduation_year}</p></div>
              <div className="md:col-span-2"><p className="text-gray-400 text-sm">Address</p><p>{applicant.residential_address}</p></div>
          </div>

          <div className="border-t border-white/10 pt-6 mt-6">
              <h4 className="font-bold mb-4">Documents</h4>
              <div className="flex gap-4">
                  {applicant.cv_resume_url && <a href={applicant.cv_resume_url} target="_blank" className="text-[#DFFF00] underline">View CV</a>}
                  {applicant.educational_cert_url && <a href={applicant.educational_cert_url} target="_blank" className="text-[#DFFF00] underline">View Education Cert</a>}
                  {applicant.nysc_cert_url && <a href={applicant.nysc_cert_url} target="_blank" className="text-[#DFFF00] underline">View NYSC Cert</a>}
              </div>
          </div>
      </div>
    </>
  );
}

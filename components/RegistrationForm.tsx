'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema, FormData } from '@/lib/formSchema';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

export default function RegistrationForm({ bookCodeId }: { bookCodeId: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{
    passport: File | null,
    eduCert: File | null,
    cv: File | null,
    nyscCert: File | null
  }>({ passport: null, eduCert: null, cv: null, nyscCert: null });

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      skills: [{ course_name: '', platform: '', year: new Date().getFullYear() }]
    }
  });

  const { fields, append } = useFieldArray({ control, name: 'skills' });
  const currentStage = watch('current_stage');

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const passportUrl = await uploadFile(files.passport!, 'applicant-docs');
      const eduCertUrl = await uploadFile(files.eduCert!, 'Edu_cert');
      const cvUrl = await uploadFile(files.cv!, 'cv_resume');
      
      let nyscCertUrl = undefined;
      if (currentStage === 'Completed NYSC' && files.nyscCert) {
        nyscCertUrl = await uploadFile(files.nyscCert, 'nysc_cert');
      }

      let statusTag = 'Student';
      if (currentStage === 'Completed NYSC') {
        statusTag = 'Job-Ready';
      } else if (currentStage === 'Waiting for NYSC' || currentStage === 'Currently Serving (NYSC)') {
        statusTag = 'Graduate';
      }
      // If we implement staff, we can add it here.

      const finalData = {
        ...data,
        passport_photo_url: passportUrl,
        educational_cert_url: eduCertUrl,
        cv_resume_url: cvUrl,
        nysc_cert_url: nyscCertUrl,
        used_book_code_id: bookCodeId,
        status_tag: statusTag
      };

      const { error: insertError } = await supabase.from('applicants').insert(finalData);
      if (insertError) throw insertError;
      
      const { error: updateCodeError } = await supabase
        .from('book_codes')
        .update({ is_used: true })
        .eq('id', bookCodeId);
      
      if (updateCodeError) throw updateCodeError;

      alert('Application submitted successfully!');
    } catch (e) {
      console.error(e);
      alert('Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 10));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 1: Identity Profile</h2>
            <input {...register('full_name')} placeholder="Full Legal Name" className="w-full bg-glass p-3 rounded border border-white/20" />
            {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 2: Demographics</h2>
            <select {...register('gender')} className="w-full bg-glass p-3 rounded border border-white/20">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
            <input type="date" {...register('date_of_birth')} className="w-full bg-glass p-3 rounded border border-white/20" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 3: Contact Details</h2>
            <input type="email" {...register('email')} placeholder="Email" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('phone_number')} placeholder="Phone Number" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('residential_address')} placeholder="Residential Address" className="w-full bg-glass p-3 rounded border border-white/20" />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 4: Education</h2>
            <input {...register('institution_name')} placeholder="Institution Name" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('course_of_study')} placeholder="Course of Study" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('degree')} placeholder="Degree" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input type="number" {...register('graduation_year')} placeholder="Graduation Year" className="w-full bg-glass p-3 rounded border border-white/20" />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 5: Current Status</h2>
            <select {...register('current_stage')} className="w-full bg-glass p-3 rounded border border-white/20">
                <option value="Final Year Student">Final Year Student</option>
                <option value="Waiting for NYSC">Waiting for NYSC</option>
                <option value="Currently Serving (NYSC)">Currently Serving (NYSC)</option>
                <option value="Completed NYSC">Completed NYSC</option>
            </select>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 6: Asset Uploads</h2>
            <p className="text-sm text-gray-400">Please upload Passport, Education Cert, and CV.</p>
            <input type="file" onChange={(e) => setFiles(prev => ({...prev, passport: e.target.files![0]}))} className="w-full bg-glass p-3 rounded border border-white/20" />
            <input type="file" onChange={(e) => setFiles(prev => ({...prev, eduCert: e.target.files![0]}))} className="w-full bg-glass p-3 rounded border border-white/20" />
            <input type="file" onChange={(e) => setFiles(prev => ({...prev, cv: e.target.files![0]}))} className="w-full bg-glass p-3 rounded border border-white/20" />
          </div>
        );
      case 7:
        return currentStage === 'Completed NYSC' ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 7: NYSC Requirements</h2>
            <input type="file" onChange={(e) => setFiles(prev => ({...prev, nyscCert: e.target.files![0]}))} className="w-full bg-glass p-3 rounded border border-white/20" />
            <input type="date" {...register('nysc_completion_date')} className="w-full bg-glass p-3 rounded border border-white/20" />
          </div>
        ) : (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Step 7: NYSC Requirements</h2>
                <p>Not applicable for your current stage.</p>
            </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 8: Skills Inventory</h2>
            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-2">
                    <input {...register(`skills.${index}.course_name`)} placeholder="Course Name" className="bg-glass p-2 rounded" />
                    <input {...register(`skills.${index}.platform`)} placeholder="Platform" className="bg-glass p-2 rounded" />
                    <input type="number" {...register(`skills.${index}.year`)} placeholder="Year" className="bg-glass p-2 rounded" />
                </div>
            ))}
            <button type="button" onClick={() => append({course_name: '', platform: '', year: new Date().getFullYear()})} className="text-sm text-[#d9f0dd]">Add Skill</button>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 9: Professional Info</h2>
            <textarea {...register('competitive_edge')} placeholder="What is your competitive edge?" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('preferred_industry')} placeholder="Industry" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('preferred_role')} placeholder="Role" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('preferred_location')} placeholder="Location" className="w-full bg-glass p-3 rounded border border-white/20" />
            <input {...register('availability')} placeholder="Availability" className="w-full bg-glass p-3 rounded border border-white/20" />
          </div>
        );
      case 10:
        return (
            <div className='space-y-4'>
                <h2 className="text-2xl font-bold">Step 10: Final Review & Submit</h2>
                <p>Review your information before submitting.</p>
                <button type="submit" disabled={loading} className="bg-[#DFFF00] text-[#0A192F] w-full px-6 py-4 rounded-full font-bold">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        )
      default:
        return <p>Step {step}</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-glass p-8 rounded-xl border border-white/10 max-w-2xl mx-auto shadow-lg cyan-glow">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-between mt-8">
        <button type="button" disabled={step === 1 || loading} onClick={prevStep} className="px-6 py-3 bg-gray-700 text-white rounded-full font-bold disabled:opacity-50">Back</button>
        {step < 10 && <button type="button" onClick={nextStep} className="px-6 py-3 bg-[#d9f0dd] text-[#0A192F] rounded-full font-bold">Next</button>}
      </div>
    </form>
  );
}
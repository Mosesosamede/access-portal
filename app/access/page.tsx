'use client';

import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import { supabase } from '@/lib/supabase';

export default function AccessPortalPage() {
  const [code, setCode] = useState('');
  const [bookCodeId, setBookCodeId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('book_codes')
        .select('*')
        .eq('code_string', code)
        .single();

      if (error || !data) {
        alert('Invalid Code');
      } else if (data.is_used) {
        alert('This code has already been used. Please purchase a new handbook to get a valid code.');
      } else {
        setBookCodeId(data.id);
        setIsVerified(true);
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-[#E0E6ED] p-12">
      <div className="bg-glass rounded-2xl border border-white/5 cyan-glow flex flex-col p-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#00D4FF] mb-4">Access Portal</h1>
        
        {!isVerified ? (
          <div className="space-y-4">
            <p className="text-xl">Enter your Access Code to unlock your registration.</p>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Access Code"
              className="w-full bg-glass p-3 rounded border border-white/20"
            />
            <button 
              onClick={handleVerify} 
              disabled={loading}
              className="px-6 py-3 bg-[#DFFF00] text-[#0A192F] rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        ) : (
          <RegistrationForm bookCodeId={bookCodeId} />
        )}
      </div>
    </main>
  );
}

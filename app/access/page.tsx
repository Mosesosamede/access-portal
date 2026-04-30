'use client';

import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import { supabase } from '@/lib/supabase';

export default function AccessPortalPage() {
  const [code, setCode] = useState('');
  const [bookCodeId, setBookCodeId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [codeUsed, setCodeUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setCodeUsed(false);
    try {
      const { data, error } = await supabase
        .from('book_codes')
        .select('*')
        .eq('code_string', code)
        .single();

      if (error || !data) {
        alert('Invalid Code');
      } else if (data.is_used) {
        setCodeUsed(true);
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
    <main className="min-h-screen text-[#E0E6ED] p-12 bg-[#0A192F]">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-12 max-w-4xl mx-auto shadow-2xl">
        <h1 className="text-4xl font-bold text-[#00D4FF] mb-6">Portal Access</h1>
        
        {codeUsed ? (
          <div className="space-y-6">
            <p className="text-xl text-amber-400">This code has already been used.</p>
            <p>Please get the book again to generate a new valid access code.</p>
            <a href="/sales" className="inline-block px-8 py-4 bg-[#DFFF00] text-[#0A192F] rounded-full font-bold text-lg hover:shadow-lg transition-all">Get the Book</a>
          </div>
        ) : !isVerified ? (
          <div className="space-y-6">
            <p className="text-xl">Enter your Access Code to journey into the portal.</p>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Access Code"
              className="w-full bg-[#0A192F]/50 p-4 rounded-xl border border-white/10 focus:border-[#00D4FF] focus:outline-none transition-all"
            />
            <button 
              onClick={handleVerify} 
              disabled={loading}
              className="px-8 py-4 bg-[#DFFF00] text-[#0A192F] rounded-xl font-bold text-lg disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {loading ? 'Verifying...' : 'Start Your Journey'}
            </button>
          </div>
        ) : (
          <RegistrationForm bookCodeId={bookCodeId} />
        )}
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import { getSupabase } from '@/lib/supabase';
const supabase = getSupabase();

export default function AccessPortalPage() {
  const [code, setCode] = useState('');
  const [bookCodeId, setBookCodeId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [codeUsed, setCodeUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = useCallback(async () => {
    setLoading(true);
    setCodeUsed(false);
    try {
      const { data, error } = await supabase
        .from('book_codes')
        .select('*')
        .eq('code_string', code)
        .single();

      if (error || !data) {
        // Handle invalid code, maybe do nothing until fully typed or show error?
      } else if (data.is_used) {
        setCodeUsed(true);
      } else {
        setBookCodeId(data.id);
        setIsVerified(true);
      }
    } catch (e) {
      console.error(e);
      // alert('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (code && code.length >= 5) { // Assuming codes are at least 5 chars
        handleVerify();
      }
    }, 1000); // 1 second debounce
    return () => clearTimeout(handler);
  }, [code, handleVerify]);

  return (
    <main className="min-h-screen text-[#E0E6ED] p-6 md:p-12 bg-transparent">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-12 max-w-2xl mx-auto shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-[#d9f0dd] mb-6 text-center md:text-left">Portal Access</h1>
        
        {codeUsed ? (
          <div className="space-y-6 text-center">
            <p className="text-lg md:text-xl text-amber-400">This code has already been used.</p>
            <p className="text-base md:text-lg">Please get the book again to generate a new valid access code.</p>
            <a href="/sales" className="inline-block px-6 py-3 md:px-8 md:py-4 bg-[#dbf0de] text-[#1a2321] rounded-full font-bold text-base md:text-lg hover:shadow-lg transition-all hover:scale-105">Get the Book</a>
          </div>
        ) : !isVerified ? (
          <div className="space-y-6">
            <p className="text-lg md:text-xl text-center md:text-left">Enter your Access Code to journey into the portal.</p>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Access Code"
              className="w-full bg-[#1a2321]/50 p-4 rounded-xl border border-white/10 focus:border-[#d9f0dd] focus:outline-none transition-all text-lg"
            />
            <button 
              onClick={handleVerify} 
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 md:px-8 md:py-4 bg-[#dbf0de] text-[#1a2321] rounded-xl font-bold text-lg disabled:opacity-50 hover:shadow-lg transition-all hover:scale-105"
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

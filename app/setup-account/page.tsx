'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function SetupAccountPage() {
  const [email, setEmail] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabase();
    
    // 1. Create User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    // 2. Link with applicants table (assuming applicants table has email field)
    if (authData.user) {
      const { error: linkError } = await supabase
        .from('applicants')
        .update({ user_id: authData.user.id })
        .eq('email', email);
        
        if (linkError) {
            console.error('Error linking user:', linkError.message);
        }
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="w-full max-w-md bg-[#112240] p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-6 text-[#DFFF00]">Create Your Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} readOnly className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" required className="w-full p-3 rounded-xl bg-white/5 border border-white/10" />
                <button type="submit" disabled={loading} className="w-full bg-[#d9f0dd] text-[#0A192F] p-3 rounded-xl font-bold hover:scale-105 transition-transform">
                    {loading ? 'Setting up...' : 'Setup Account'}
                </button>
            </form>
        </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

const supabase = getSupabase();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      // 1. Check if the applicant exists first to provide specific feedback
      const { data: applicant, error: checkError } = await supabase
        .from('applicants')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        console.error('Check error:', checkError);
      }

      if (!applicant) {
        setErrorMessage('Email address not recognized. Please register first.');
        setLoading(false);
        return;
      }

      // 2. Attempt login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error details:', error);
        if (error.message.includes('credentials')) {
          setErrorMessage('Incorrect password. Please check your password and try again.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0A192F]">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-12 max-w-md w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-[#d9f0dd] mb-6 text-center">Welcome Back</h1>
        <p className="text-white text-center mb-8">Enter your credentials to access your dashboard.</p>
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email Address" 
            className="w-full bg-[#0A192F]/50 p-4 rounded-xl border border-white/10 text-white focus:border-cyan-500 transition-all outline-none" 
            required
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            className="w-full bg-[#0A192F]/50 p-4 rounded-xl border border-white/10 text-white focus:border-cyan-500 transition-all outline-none" 
            required
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full px-6 py-4 bg-[#DFFF00] text-[#0A192F] rounded-full font-bold hover:shadow-lg transition-all hover:scale-105"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}

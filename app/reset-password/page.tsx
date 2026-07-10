'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setMessage('Your password has been reset successfully! Redirecting you to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#1a2321]">
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-12 max-w-md w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-[#dbf0de] mb-6 text-center">New Password</h1>
        <p className="text-white text-center mb-8">Enter your new secure password below.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm text-center">
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="New Password" 
                className="w-full bg-[#1a2321]/50 p-4 pr-12 rounded-xl border border-white/10 text-white focus:border-[#dbf0de] transition-all outline-none" 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input 
              type={showPassword ? 'text' : 'password'} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm New Password" 
              className="w-full bg-[#1a2321]/50 p-4 rounded-xl border border-white/10 text-white focus:border-[#dbf0de] transition-all outline-none" 
              required
            />

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full px-6 py-4 bg-[#dbf0de] text-[#1a2321] rounded-full font-bold hover:shadow-lg transition-all hover:scale-105 flex justify-center items-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

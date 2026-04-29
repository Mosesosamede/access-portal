'use client';
import { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { supabase } from '@/lib/supabase';

const PRICES = { 
  NGN: { label: 'NGN 15,000', value: 15000 },
  USD: { label: 'USD 10.99', value: 10.99 },
  GBP: { label: 'GBP 8.09', value: 8.09 },
  EUR: { label: 'EUR 9.38', value: 9.38 }
};

export default function BuyBook() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<{code: string} | null>(null);

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || '',
    tx_ref: `deloxe-tx-${Date.now()}`,
    amount: PRICES[currency as keyof typeof PRICES].value,
    currency,
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: email,
      name: name,
    },
    customizations: {
      title: 'Get Hired Handbook',
      description: 'Payment for Get Hired Handbook',
      logo: 'https://i.ibb.co/KzNwhhj3/getting-hire-got-easier.png',
    },
  };
  const fw = useFlutterwave(config);

  const handleBuy = () => {
    if (!email || !name) { alert('Please enter name and email'); return; }
    
    fw({
      callback: async (response: any) => {
        closePaymentModal();
        if (response.status === 'successful') {
          handleSuccess(response);
        } else {
          alert('Payment cancelled / failed');
        }
      },
      onClose: () => {},
    });
  };

  const handleSuccess = async (response: any) => {
    setLoading(true);
    try {
        // 1. Insert into purchases table
        const { data: purchase, error: pErr } = await supabase
            .from('purchases')
            .insert({ customer_email: email, amount_paid: response.amount })
            .select('*')
            .single();
        if (pErr) throw pErr;

        // 2. Query / update available book code
        const { data: codeData, error: cErr } = await supabase
            .from('book_codes')
            .update({ purchase_id: purchase.id }) 
            .eq('is_used', false)
            .limit(1)
            .select('*')
            .single();
        
        if (cErr || !codeData) throw new Error("No codes available or error");

        setTxResult({ code: codeData.code_string });
        alert('Matriculation Successful!');
    } catch(e) {
        console.error(e);
        alert('Error finalizing purchase. Please contact support.');
    } finally {
        setLoading(false);
    }
  };

  if (txResult) {
    return (
        <div className="bg-glass p-8 rounded-xl border border-white/20 text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#DFFF00]">Matriculation Successful!</h2>
            <p className="text-sm mb-4">Your Access Code is:</p>
            <div className="bg-[#0A192F] p-4 text-2xl font-mono text-[#00D4FF] mb-6 rounded border border-[#00D4FF]">
                {txResult.code}
            </div>
            <a href="https://access.deloxehr.com" className="bg-[#00D4FF] text-[#0A192F] px-8 py-3 rounded-full font-bold">Proceed to Access Portal</a>
        </div>
    )
  }

  return (
    <div className="bg-glass rounded-2xl border border-white/5 p-8 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-[#DFFF00]">{PRICES[currency as keyof typeof PRICES].label}</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-[#0A192F] p-2 rounded text-white border border-gray-700">
                {Object.keys(PRICES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0A192F] p-3 rounded mb-4 border-b-2 border-transparent transition-all focus:border-[#00D4FF] focus:outline-none" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0A192F] p-3 rounded mb-4 border-b-2 border-transparent transition-all focus:border-[#00D4FF] focus:outline-none" />
        
        <button 
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-[#DFFF00] text-[#0A192F] px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
        >
            {loading ? 'Processing...' : `Buy Handbook`}
        </button>
    </div>
  );
}

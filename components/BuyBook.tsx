'use client';
import { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { PRICES } from '@/lib/constants';

export default function BuyBook() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currency, setCurrency] = useState<keyof typeof PRICES>('NGN');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<{code: string} | null>(null);

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || '',
    tx_ref: `deloxe-tx-${Date.now()}`,
    amount: PRICES[currency],
    currency,
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email,
      name,
      phone_number: phoneNumber,
    },
    customizations: {
      title: 'Get Hired Handbook',
      description: 'Payment for Get Hired Handbook',
      logo: 'https://i.ibb.co/KzNwhhj3/getting-hire-got-easier.png',
    },
  };

  const fw = useFlutterwave(config);

  const handleBuy = () => {
    if (!email || !name || !phoneNumber) { alert('Please enter name, email, and phone number'); return; }
    
    fw({
      callback: async (response: any) => {
        closePaymentModal();
        if (response.status === 'successful') {
          handleVerify(response.transaction_id);
        } else {
          alert('Payment cancelled / failed');
        }
      },
      onClose: () => {},
    });
  };

  const handleVerify = async (transaction_id: string) => {
    setLoading(true);
    try {
        const res = await fetch('/api/verify-payment', {
            method: 'POST',
            body: JSON.stringify({ transaction_id, expectedCurrency: currency, userEmail: email }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.success) {
            setTxResult({ code: data.code });
            alert('Matriculation Successful!');
        } else {
            throw new Error(data.message || 'Verification failed');
        }
    } catch(e) {
        console.error(e);
        alert('Error finalizing purchase. Please contact support.');
    } finally {
        setLoading(false);
    }
  };

  if (txResult) {
    return (
        <div className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 text-center shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#DFFF00]">Matriculation Successful!</h2>
            <p className="text-sm mb-4">Your Access Code is:</p>
            <div className="bg-[#0A192F] p-4 text-xl md:text-2xl font-mono text-[#d9f0dd] mb-6 rounded-xl border border-[#d9f0dd]">
                {txResult.code}
            </div>
            <a href="https://access.deloxehr.com" className="inline-block bg-[#d9f0dd] text-[#0A192F] px-6 py-3 md:px-8 md:py-4 rounded-full font-bold hover:scale-105 transition-transform text-sm md:text-base">Get your book inside the portal</a>
        </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <span className="text-xl md:text-2xl font-bold text-[#DFFF00]">{currency} {PRICES[currency]}</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as keyof typeof PRICES)} className="bg-[#0A192F] p-2 rounded-xl text-white border border-gray-700">
                {Object.keys(PRICES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0A192F] p-3 md:p-4 rounded-xl mb-4 border border-transparent focus:border-[#d9f0dd] focus:outline-none transition-all" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0A192F] p-3 md:p-4 rounded-xl mb-4 border border-transparent focus:border-[#d9f0dd] focus:outline-none transition-all" />
        <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-[#0A192F] p-3 md:p-4 rounded-xl mb-4 border border-transparent focus:border-[#d9f0dd] focus:outline-none transition-all" />
        
        <button 
            onClick={handleBuy}
            disabled={loading}
            className="w-full bg-[#DFFF00] text-[#0A192F] px-6 py-3 md:px-8 md:py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform text-sm md:text-base"
        >
            {loading ? 'Processing...' : `Buy Handbook`}
        </button>
    </div>
  );
}

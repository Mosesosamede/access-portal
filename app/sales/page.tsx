import type { Metadata } from 'next';
import Image from 'next/image';
import BuyBook from '@/components/BuyBook';

export const metadata: Metadata = {
  title: 'Get Hired Handbook | Deloxe HR',
  description: 'Master your career with the Get Hired Handbook and fast-track your internship.',
};

export default function SalesHubPage() {
  return (
    <main className="min-h-screen text-[#E0E6ED] p-12">
      <div className="bg-glass rounded-2xl border border-white/5 cyan-glow flex flex-col md:flex-row gap-12 p-12 items-center">
        <div className="flex-1">
          <h1 className="text-4xl font-bold lemon-text mb-4">Get Hired Handbook</h1>
          <p className="text-xl mb-8">Your ultimate guide to securing your dream internship. Purchase now to receive your unique Access Code and start your 4-year internship track.</p>
          <BuyBook />
        </div>
        <div className="flex-none">
          <Image 
            src="https://i.ibb.co/KzNwhhj3/getting-hire-got-easier.png"
            alt="Get Hired Handbook"
            width={300}
            height={400}
            className="rounded-lg shadow-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </main>
  );
}

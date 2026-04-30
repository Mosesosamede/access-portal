import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0A192F] text-[#E0E6ED] p-12">
      <h1 className="text-5xl font-bold mb-8">Deloxe HR Ecosystem</h1>
      
      <div className="max-w-md text-center mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
        <p className="text-lg">
          To access the portal, please purchase the Get Hired Handbook. 
          You will receive a unique access code required for your registration.
        </p>
        <div className="mt-4 text-4xl text-[#00D4FF] animate-bounce">↓</div>
      </div>

      <div className="flex gap-6">
        <Link href="/sales" className="px-8 py-4 bg-[#DFFF00] text-[#0A192F] rounded-full font-bold text-lg hover:shadow-lg transition-all">
          Handbook here
        </Link>
        <Link href="/access" className="px-8 py-4 bg-transparent border border-[#00D4FF] text-[#00D4FF] rounded-full font-bold text-lg hover:bg-[#00D4FF] hover:text-[#0A192F] transition-all">
          Start Your Journey
        </Link>
      </div>
    </main>
  );
}

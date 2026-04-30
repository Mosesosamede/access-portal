import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-transparent text-[#E0E6ED] p-6 md:p-12">
      <Image src="https://i.ibb.co/pjxqNW0p/favicon.png" alt="Deloxe HR Logo" width={100} height={100} className="mb-6" referrerPolicy="no-referrer" />
      <h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-center text-white">Deloxe HR Ecosystem</h1>
      
      <div className="max-w-md text-center mb-8 bg-white/5 p-5 md:p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
        <p className="text-base md:text-lg">
          To access the portal, please purchase the Get Hired Handbook. 
          You will receive a unique access code required for your registration.
        </p>
        <div className="mt-4 text-3xl md:text-4xl text-[#d9f0dd] animate-bounce">↓</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto">
        <Link href="/sales" className="px-6 py-3 md:px-8 md:py-4 bg-[#DFFF00] text-[#0A192F] rounded-full font-bold text-base md:text-lg hover:shadow-lg transition-all hover:scale-105 text-center">
          Handbook here
        </Link>
        <Link href="/access" className="px-6 py-3 md:px-8 md:py-4 bg-transparent border border-[#d9f0dd] text-[#d9f0dd] rounded-full font-bold text-base md:text-lg hover:bg-[#d9f0dd] hover:text-[#0A192F] transition-all text-center">
          Start Your Journey
        </Link>
      </div>
    </main>
  );
}

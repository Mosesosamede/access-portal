import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0A192F] text-[#E0E6ED] p-12">
      <h1 className="text-5xl font-bold mb-8">Deloxe HR Ecosystem</h1>
      <div className="flex gap-6">
        <Link href="/sales" className="px-6 py-3 bg-[#DFFF00] text-[#0A192F] rounded-lg font-bold">
          Go to Sales Hub
        </Link>
        <Link href="/access" className="px-6 py-3 bg-[#00D4FF] text-[#0A192F] rounded-lg font-bold">
          Go to Access Portal
        </Link>
      </div>
    </main>
  );
}

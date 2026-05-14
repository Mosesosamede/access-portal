import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HandbookPage() {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">My Handbook</h2>
      <div className="bg-[rgb(50,60,55)] p-8 rounded-3xl border border-white/10 shadow-lg">
          <p className="mb-6">Access your main handbook here.</p>
          <a href="/handbook.pdf" download="Handbook.pdf" className="inline-block bg-[#DFFF00] text-[rgb(38,47,44)] px-6 py-3 rounded-xl font-bold">
              Download Handbook
          </a>
      </div>
    </DashboardLayout>
  );
}

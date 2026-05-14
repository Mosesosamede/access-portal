import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-[#DFFF00]">Profile</h2>
      <div className="bg-[#112240] p-8 rounded-3xl border border-white/10 shadow-lg">
          <p>Profile content goes here.</p>
      </div>
    </DashboardLayout>
  );
}

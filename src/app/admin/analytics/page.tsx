'use client';

import { useRouter } from 'next/navigation';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-end gap-2 mb-8">
          <div className="flex flex-row items-end gap-2">
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8 mb-1" />
            <h1 className="hidden md:block font-meno-banner text-base font-bold">
              Analytics Dashboard
            </h1>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="bg-[#E87F6B] text-white font-gibson text-sm font-medium px-4 py-2 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
          >
            Back to Admin
          </button>
        </div>

        <AnalyticsDashboard />
      </div>
    </main>
  );
}

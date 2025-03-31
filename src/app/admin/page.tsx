'use client';

import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-end gap-2 mb-8">
          <div className="flex flex-row items-end gap-2">
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8 mb-1" />
            <h1 className="hidden md:block font-[var(--font-meno-banner)] text-base font-bold">
              Admin Dashboard
            </h1>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#E87F6B] text-white font-[var(--font-gibson)] text-sm font-medium px-4 py-2 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
          >
            Back to Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold mb-4">Add Multiple Providers</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)]">
              Upload multiple DME providers at once using a CSV file.
            </p>
            <button
              onClick={() => router.push('/admin/bulk-upload')}
              className="w-full bg-[#E87F6B] text-white font-[var(--font-gibson)] text-base py-3 rounded hover:bg-[#e06a53] transition-colors"
            >
              Add Providers in Bulk
            </button>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold mb-4">Add Single Provider</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)]">
              Add a single DME provider with detailed information.
            </p>
            <button
              onClick={() => router.push('/admin/add-provider')}
              className="w-full bg-[#E87F6B] text-white font-[var(--font-gibson)] text-base py-3 rounded hover:bg-[#e06a53] transition-colors"
            >
              Add New Provider
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 
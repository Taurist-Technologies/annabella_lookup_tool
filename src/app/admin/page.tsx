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
            <h1 className="hidden md:block font-meno-banner text-base font-bold">
              Admin Dashboard
            </h1>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#E87F6B] text-white font-gibson text-sm font-medium px-4 py-2 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
          >
            Back to Search
          </button>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-meno-banner text-2xl font-bold mb-4">Add New Provider</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)]">
              Add a new DME provider by filling out the form or uploading a CSV file. You'll be able to preview the data before submitting.
            </p>
            <button
              onClick={() => router.push('/admin/add-provider')}
              className="w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e06a53] transition-colors"
            >
              Add New Provider
            </button>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-meno-banner text-2xl font-bold mb-4">Update Existing Provider</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)]">
              Search for an existing DME provider and update their details like name, phone, email, and dedicated link.
            </p>
            <button
              onClick={() => router.push('/admin/update-provider')}
              className="w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e06a53] transition-colors"
            >
              Update Existing Provider
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { config } from '../config';

export default function AdminPage() {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadEmails = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch(`${config.apiUrl}/api/export/user-emails`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download emails');
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user_emails.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading emails:', error);
      alert('Failed to download emails. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-meno-banner text-xl font-bold mb-3">Analytics Dashboard</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)] text-sm">
              View click analytics, user engagement metrics, and provider performance data.
            </p>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="w-full bg-[#E87F6B] text-white font-gibson text-sm py-2.5 rounded hover:bg-[#e06a53] transition-colors"
            >
              View Analytics Dashboard
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-meno-banner text-xl font-bold mb-3">Download User Emails</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)] text-sm">
              Export all user emails from the database as a CSV file for marketing or analysis purposes.
            </p>
            <button
              onClick={handleDownloadEmails}
              disabled={isDownloading}
              className="w-full bg-[#E87F6B] text-white font-gibson text-sm py-2.5 rounded hover:bg-[#e06a53] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Downloading...' : 'Download User Emails CSV'}
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-meno-banner text-xl font-bold mb-3">Add New Provider</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)] text-sm">
              Add a new DME provider by filling out the form or uploading a CSV file. You'll be able to preview the data before submitting.
            </p>
            <button
              onClick={() => router.push('/admin/add-provider')}
              className="w-full bg-[#E87F6B] text-white font-gibson text-sm py-2.5 rounded hover:bg-[#e06a53] transition-colors"
            >
              Add New Provider
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-meno-banner text-xl font-bold mb-3">Update Existing Provider</h2>
            <p className="text-gray-600 mb-6 font-[var(--font-ga-maamli)] text-sm">
              Search for an existing DME provider and update their details like name, phone, email, and dedicated link.
            </p>
            <button
              onClick={() => router.push('/admin/update-provider')}
              className="w-full bg-[#E87F6B] text-white font-gibson text-sm py-2.5 rounded hover:bg-[#e06a53] transition-colors"
            >
              Update Existing Provider
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 
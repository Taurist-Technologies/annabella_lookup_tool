'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsList } from '../../components/ResultsList';
import { DMEProvider } from '../../types';
import { config } from '../../config';
export default function BulkUploadPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [csvDMEs, setCSVDMEs] = useState<DMEProvider[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      
      const dmes: DMEProvider[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(value => value.trim().toLowerCase());
        const dme: any = {
          id: i, // Temporary ID for preview
          company_name: values[headers.indexOf('company_name')] || '',
          state: values[headers.indexOf('state')] || '',
          insurance_providers: values[headers.indexOf('insurance_providers')]?.split(';') || [],
          phone_number: values[headers.indexOf('phone_number')] || '',
          email: values[headers.indexOf('email')] || '',
          weblink: values[headers.indexOf('weblink')] || '',
          multiple_pump_models: values[headers.indexOf('multiple_pump_models')] === 'true' || values[headers.indexOf('multiple_pump_models')] === 'yes' || values[headers.indexOf('multiple_pump_models')] === '1',
          upgrade_pumps_available: values[headers.indexOf('upgrade_pumps_available')] === 'true' || values[headers.indexOf('upgrade_pumps_available')] === 'yes' || values[headers.indexOf('upgrade_pumps_available')] === '1',
          resupply_available: values[headers.indexOf('resupply_available')] === 'true' || values[headers.indexOf('resupply_available')] === 'yes' || values[headers.indexOf('resupply_available')] === '1',
          accessories_available: values[headers.indexOf('accessories_available')] === 'true' || values[headers.indexOf('accessories_available')] === 'yes' || values[headers.indexOf('accessories_available')] === '1',
          lactation_services_available: values[headers.indexOf('lactation_services_available')] === 'true' || values[headers.indexOf('lactation_services_available')] === 'yes' || values[headers.indexOf('lactation_services_available')] === '1',
        };
        dmes.push(dme);
      }
      
      setCSVDMEs(dmes);
      setIsPreviewMode(true);
    };
    
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${config.apiUrl}/api/dme/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dmes: csvDMEs }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add DME providers');
      }

      setSuccess('DME providers added successfully!');
      setCSVDMEs([]);
      setIsPreviewMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-end gap-2 mb-8">
          <div className="flex flex-row items-end gap-2">
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8 mb-1" />
            <h1 className="hidden md:block font-meno-banner text-base font-bold">
              Bulk Upload DME Providers
            </h1>
          </div>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-[#E87F6B] text-white font-gibson text-sm font-medium px-4 py-2 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
          >
            Back to Admin
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-[#60DFD0]/10 border border-[#60DFD0] text-[#2C8A81] px-6 py-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="font-meno-banner text-2xl font-bold mb-6">Upload CSV File</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-gibson
                file:bg-[#E87F6B] file:text-white
                hover:file:bg-[#e06a53] file:transition-colors"
            />
          </div>
          <p className="mt-4 text-sm font-[var(--font-ga-maamli)] text-gray-600">
            Upload a CSV file with the following headers: company_name, state, insurance_providers (semicolon-separated), phone_number, email, weblink, multiple_pump_models, upgrade_pumps_available, resupply_available, accessories_available, lactation_services_available
          </p>
        </div>

        {isPreviewMode && csvDMEs.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <h2 className="font-meno-banner text-2xl font-bold">Preview DME Providers</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-700 font-gibson text-sm font-medium rounded border border-gray-200 hover:bg-gray-200 transition-colors"
                  >
                    Upload New File
                  </button>
                  <button
                    onClick={handleBulkSubmit}
                    className="w-full sm:w-auto px-6 py-2 bg-[#E87F6B] text-white font-gibson text-sm font-medium rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
                  >
                    Submit {csvDMEs.length} Provider{csvDMEs.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
              <ResultsList results={csvDMEs} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 
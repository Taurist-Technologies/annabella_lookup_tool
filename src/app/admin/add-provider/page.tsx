'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsList } from '../../components/ResultsList';
import { DMEProvider } from '../../types';
import { config } from '../../config';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading-animation.json';

export default function AddProviderPage() {
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<DMEProvider | null>(null);
  const [isCsvMode, setIsCsvMode] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      if (lines.length < 2) {
        setError('CSV file must contain at least one data row');
        return;
      }

      const values = lines[1].split(',').map(v => v.trim());
      const dme: DMEProvider = {
        id: 0,
        dme_name: values[headers.indexOf('dme name')] || '',
        state: values[headers.indexOf('state')] || '',
        insurance_providers: [values[headers.indexOf('insurance')] || ''].filter(Boolean),
        phone: values[headers.indexOf('phone number')] || '',
        email: values[headers.indexOf('email')] || '',
        dedicated_link: values[headers.indexOf('dedicated link')] || '',
        resupply_available: values[headers.indexOf('resupply available')]?.toLowerCase() === 'yes',
        accessories_available: values[headers.indexOf('accessories available')]?.toLowerCase() === 'yes',
        lactation_services_available: values[headers.indexOf('lactation services available')]?.toLowerCase() === 'yes',
      };

      console.log('Parsed DME:', dme);
      setCsvPreview(dme);
      setIsCsvMode(true);
      setIsPreviewMode(true);
    };
    reader.readAsText(file);
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPreviewMode(true);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!csvFile) {
      setError('Please upload a CSV file first');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch(`${config.apiUrl}/api/upload_providers`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to add DME provider');
      }

      setSuccess('DME provider added successfully!');
      setCsvFile(null);
      setCsvPreview(null);
      setIsCsvMode(false);
      setIsPreviewMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const previewData: DMEProvider = csvPreview || {
    id: 0,
    dme_name: '',
    state: '',
    insurance_providers: [],
    phone: '',
    email: '',
    dedicated_link: '',
    resupply_available: false,
    accessories_available: false,
    lactation_services_available: false,
  };

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-end gap-2 mb-8">
          <div className="flex flex-row items-end gap-2">
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8 mb-1" />
            <h1 className="hidden md:block font-meno-banner text-base font-bold">
              Add New DME Provider
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="max-w-xs w-full">
              <Lottie 
                animationData={loadingAnimation} 
                loop={true}
                style={{ width: '100%', height: 'auto' }}
              />
              <p className="text-center mt-4 font-gibson text-[#606060]">
                Processing your CSV file...
              </p>
            </div>
          </div>
        ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="font-meno-banner text-2xl font-bold mb-6">Load Provider Details</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-gibson font-medium text-[#606060] mb-2">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                />
                <p className="mt-2 text-sm text-gray-500">
                  CSV should include: DME Name, State, Insurance, Phone Number, Email, Dedicated Link, Resupply Available, Accessories Available, Location Services Available
                </p>
              </div>
            </div>
          </div>

          {isPreviewMode && (
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="font-meno-banner text-2xl font-bold mb-6">Preview</h2>
                <ResultsList results={[previewData]} />
                <div className="mt-6">
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e06a53] transition-colors"
                  >
                    Submit Provider
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </main>
  );
} 
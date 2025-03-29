'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsList } from '../components/ResultsList';
import { DMEProvider } from '../types';

interface DMEFormData {
  company_name: string;
  state: string;
  insurance_providers: string[];
  phone_number: string;
  email: string;
  weblink: string;
  multiple_pump_models: boolean;
  upgrade_pumps_available: boolean;
  resupply_available: boolean;
  accessories_available: boolean;
  lactation_services_available: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DMEFormData>({
    company_name: '',
    state: '',
    insurance_providers: [],
    phone_number: '',
    email: '',
    weblink: '',
    multiple_pump_models: false,
    upgrade_pumps_available: false,
    resupply_available: false,
    accessories_available: false,
    lactation_services_available: false,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [csvDMEs, setCSVDMEs] = useState<DMEProvider[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/dme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add DME provider');
      }

      setSuccess('DME provider added successfully!');
      setFormData({
        company_name: '',
        state: '',
        insurance_providers: [],
        phone_number: '',
        email: '',
        weblink: '',
        multiple_pump_models: false,
        upgrade_pumps_available: false,
        resupply_available: false,
        accessories_available: false,
        lactation_services_available: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCheckboxChange = (field: keyof DMEFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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
        
        const values = lines[i].split(',').map(value => value.trim());
        const dme: any = {
          id: i, // Temporary ID for preview
          company_name: values[headers.indexOf('company_name')] || '',
          state: values[headers.indexOf('state')] || '',
          insurance_providers: values[headers.indexOf('insurance_providers')]?.split(';') || [],
          phone_number: values[headers.indexOf('phone_number')] || '',
          email: values[headers.indexOf('email')] || '',
          weblink: values[headers.indexOf('weblink')] || '',
          multiple_pump_models: values[headers.indexOf('multiple_pump_models')] === 'true',
          upgrade_pumps_available: values[headers.indexOf('upgrade_pumps_available')] === 'true',
          resupply_available: values[headers.indexOf('resupply_available')] === 'true',
          accessories_available: values[headers.indexOf('accessories_available')] === 'true',
          lactation_services_available: values[headers.indexOf('lactation_services_available')] === 'true',
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
      const response = await fetch('http://localhost:8000/api/dme/bulk', {
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
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8" />
            <h1 className="hidden md:block font-[var(--font-meno-banner)] text-base font-bold pb-1">
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

        <div className="bg-white rounded-lg p-8 mb-8 shadow-sm">
          <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold mb-6">Bulk Upload DME Providers</h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-[var(--font-gibson)]
                file:bg-[#E87F6B] file:text-white
                hover:file:bg-[#e06a53] file:transition-colors"
            />
            {csvDMEs.length > 0 && (
              <button
                onClick={handleBulkSubmit}
                className="px-6 py-2 bg-[#E87F6B] text-white font-[var(--font-gibson)] text-sm font-medium rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
              >
                Submit {csvDMEs.length} DME Provider{csvDMEs.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
          <p className="mt-4 text-sm font-[var(--font-ga-maamli)] text-gray-600">
            Upload a CSV file with the following headers: company_name, state, insurance_providers (semicolon-separated), phone_number, email, weblink, multiple_pump_models, upgrade_pumps_available, resupply_available, accessories_available, lactation_services_available
          </p>
        </div>

        {isPreviewMode && csvDMEs.length > 0 && (
          <div className="mb-8">
            <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold mb-6">Preview DME Providers Ready to be Added</h2>
            <ResultsList results={csvDMEs} />
          </div>
        )}

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold mb-6">Add Single DME Provider</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Company Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">State</label>
              <input
                type="text"
                required
                maxLength={2}
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
              />
            </div>

            <div>
              <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Insurance Providers (comma-separated)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                value={formData.insurance_providers.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  insurance_providers: e.target.value.split(',').map(provider => provider.trim())
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Website Link</label>
              <input
                type="url"
                required
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                value={formData.weblink}
                onChange={(e) => setFormData(prev => ({ ...prev, weblink: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-[var(--font-gibson)] text-lg font-medium text-gray-900">Provider Features</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                    checked={formData.multiple_pump_models}
                    onChange={() => handleCheckboxChange('multiple_pump_models')}
                  />
                  <span className="font-[var(--font-gibson)] font-light">Multiple Pump Models</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                    checked={formData.upgrade_pumps_available}
                    onChange={() => handleCheckboxChange('upgrade_pumps_available')}
                  />
                  <span className="font-[var(--font-gibson)] font-light">Upgrade Pumps Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                    checked={formData.resupply_available}
                    onChange={() => handleCheckboxChange('resupply_available')}
                  />
                  <span className="font-[var(--font-gibson)] font-light">Resupply Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                    checked={formData.accessories_available}
                    onChange={() => handleCheckboxChange('accessories_available')}
                  />
                  <span className="font-[var(--font-gibson)] font-light">Accessories Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                    checked={formData.lactation_services_available}
                    onChange={() => handleCheckboxChange('lactation_services_available')}
                  />
                  <span className="font-[var(--font-gibson)] font-light">Location Services Available</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#E87F6B] text-white font-[var(--font-gibson)] text-base py-3 rounded hover:bg-[#e06a53] transition-colors mt-8"
            >
              Add Provider
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 
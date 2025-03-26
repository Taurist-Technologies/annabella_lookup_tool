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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New DME Provider</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Bulk Upload DME Providers</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {csvDMEs.length > 0 && (
            <button
              onClick={handleBulkSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Submit {csvDMEs.length} DME Provider{csvDMEs.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Upload a CSV file with the following headers: company_name, state, insurance_providers (semicolon-separated), phone_number, email, weblink, multiple_pump_models, upgrade_pumps_available, resupply_available, accessories_available, lactation_services_available
        </p>
      </div>

      {isPreviewMode && csvDMEs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Preview DME Providers</h2>
          <ResultsList results={csvDMEs} />
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Add Single DME Provider</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              required
              maxLength={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Insurance Providers (comma-separated)</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.insurance_providers.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                insurance_providers: e.target.value.split(',').map(provider => provider.trim())
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.weblink}
              onChange={(e) => setFormData(prev => ({ ...prev, weblink: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.multiple_pump_models}
                onChange={() => handleCheckboxChange('multiple_pump_models')}
              />
              <label className="ml-2 block text-sm text-gray-900">Multiple Pump Models Available</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.upgrade_pumps_available}
                onChange={() => handleCheckboxChange('upgrade_pumps_available')}
              />
              <label className="ml-2 block text-sm text-gray-900">Upgrade Pumps Available</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.resupply_available}
                onChange={() => handleCheckboxChange('resupply_available')}
              />
              <label className="ml-2 block text-sm text-gray-900">Resupply Available</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.accessories_available}
                onChange={() => handleCheckboxChange('accessories_available')}
              />
              <label className="ml-2 block text-sm text-gray-900">Accessories Available</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.lactation_services_available}
                onChange={() => handleCheckboxChange('lactation_services_available')}
              />
              <label className="ml-2 block text-sm text-gray-900">Lactation Services Available</label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add DME Provider
          </button>
        </form>
      </div>
    </div>
  );
} 
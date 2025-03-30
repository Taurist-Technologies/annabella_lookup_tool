'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsList } from '../../components/ResultsList';
import { DMEProvider } from '../../types';

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

export default function AddProviderPage() {
  const router = useRouter();
  const [insuranceInput, setInsuranceInput] = useState('');
  
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters from both current and previous values
    const digits = value.replace(/\D/g, '');
    
    // If we have no digits, return empty string
    if (digits.length === 0) return '';
    
    // Format the number as XXX-XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

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
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPreviewMode(true);
  };

  const handleSubmit = async () => {
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
      setIsPreviewMode(false);
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

  const previewData: DMEProvider = {
    id: 0,
    ...formData
  };

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-end gap-2 mb-8">
          <div className="flex flex-row items-end gap-2">
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8 mb-1" />
            <h1 className="hidden md:block font-[var(--font-meno-banner)] text-base font-bold">
              Add Single DME Provider
            </h1>
          </div>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-[#E87F6B] text-white font-[var(--font-gibson)] text-sm font-medium px-4 py-2 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
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

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold mb-6">Provider Details</h2>
              <form onSubmit={handlePreview} className="space-y-6">
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
                  <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">State (2-letter abbreviation) Example: CA, TX, etc.</label>
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
                  <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Insurance Providers (comma-separated) Example: Aetna, Cigna, etc.</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                    value={insuranceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInsuranceInput(value);
                      setFormData(prev => ({
                        ...prev,
                        insurance_providers: value === '' 
                          ? [] 
                          : value.split(',').map(provider => provider.trim()).filter(Boolean)
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={12}
                    className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-[var(--font-quicksand)] text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                    value={formData.phone_number}
                    onChange={(e) => {
                      const formattedNumber = formatPhoneNumber(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        phone_number: formattedNumber
                      }));
                    }}
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
                  <label className="block text-sm font-[var(--font-quicksand)] font-medium text-[#606060] mb-2">Website Link (include http:// or https://)</label>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                        checked={formData.multiple_pump_models}
                        onChange={() => handleCheckboxChange('multiple_pump_models')}
                      />
                      <span className="font-[var(--font-gibson)] font-light">Multiple Pump Models</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                        checked={formData.upgrade_pumps_available}
                        onChange={() => handleCheckboxChange('upgrade_pumps_available')}
                      />
                      <span className="font-[var(--font-gibson)] font-light">Upgrade Pumps Available</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                        checked={formData.resupply_available}
                        onChange={() => handleCheckboxChange('resupply_available')}
                      />
                      <span className="font-[var(--font-gibson)] font-light">Resupply Available</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-[#ACACAD] text-[#E87F6B] focus:ring-[#E87F6B]"
                        checked={formData.accessories_available}
                        onChange={() => handleCheckboxChange('accessories_available')}
                      />
                      <span className="font-[var(--font-gibson)] font-light">Accessories Available</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
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
                  disabled={isPreviewMode}
                >
                  Preview Provider
                </button>
              </form>
            </div>
          </div>

          {isPreviewMode && (
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                  <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold">Preview Provider Details</h2>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => setIsPreviewMode(false)}
                      className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-700 font-[var(--font-gibson)] text-sm font-medium rounded border border-gray-200 hover:bg-gray-200 transition-colors"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="w-full sm:w-auto px-6 py-2 bg-[#E87F6B] text-white font-[var(--font-gibson)] text-sm font-medium rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
                    >
                      Confirm & Submit
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-[var(--font-meno-banner)] text-xl font-bold text-black mb-4">
                      {formData.company_name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <p className="font-[var(--font-ga-maamli)] text-sm">
                        <span className="font-bold">Phone Number:</span> {formData.phone_number}
                      </p>
                      <p className="font-[var(--font-ga-maamli)] text-sm">
                        <span className="font-bold">Email:</span> {formData.email}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-[var(--font-gibson)] font-light text-sm">Multiple Pump Models</span>
                        <span className={`text-base ${formData.multiple_pump_models ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                          {formData.multiple_pump_models ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-[var(--font-gibson)] font-light text-sm">Upgrade Pumps Available</span>
                        <span className={`text-base ${formData.upgrade_pumps_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                          {formData.upgrade_pumps_available ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-[var(--font-gibson)] font-light text-sm">Resupply Available</span>
                        <span className={`text-base ${formData.resupply_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                          {formData.resupply_available ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-[var(--font-gibson)] font-light text-sm">Accessories Available</span>
                        <span className={`text-base ${formData.accessories_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                          {formData.accessories_available ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-[var(--font-gibson)] font-light text-sm">Location Services Available</span>
                        <span className={`text-base ${formData.lactation_services_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                          {formData.lactation_services_available ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-[#E87F6B] text-white font-[var(--font-gibson)] text-base py-3 rounded hover:bg-[#e06a53] transition-colors mt-6"
                    >
                      SUBMIT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 
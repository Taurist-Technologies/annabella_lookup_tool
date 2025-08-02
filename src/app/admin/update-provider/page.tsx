'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DMEProvider } from '../../types';
import { config } from '../../config';
import React from 'react';

export default function UpdateProviderPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DMEProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<DMEProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dedicated_link: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvUploadStatus, setCsvUploadStatus] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.apiUrl}/api/providers/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      const data = await response.json();
      setSearchResults(data);
      
      if (data.length === 0) {
        setError('No providers found matching your search');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProvider = (provider: DMEProvider) => {
    setSelectedProvider(provider);
    setFormData({
      name: provider.dme_name,
      phone: provider.phone || '',
      email: provider.email || '',
      dedicated_link: provider.dedicated_link || ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${config.apiUrl}/api/provider/${selectedProvider.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          dedicated_link: formData.dedicated_link
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update provider');
      }
      
      setSuccess('Provider updated successfully!');
      // Clear selected provider and search results after successful update
      setSelectedProvider(null);
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProvider = async () => {
    if (!selectedProvider) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${config.apiUrl}/api/provider/${selectedProvider.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete provider');
      }
      setSuccess('Provider deleted successfully!');
      setSelectedProvider(null);
      setSearchResults([]);
      setSearchTerm('');
      setShowDeleteModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setCsvUploadStatus('');
    } else {
      setCsvFile(null);
      setCsvUploadStatus('Please select a valid CSV file');
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !csvFile) return;
    
    setCsvUploading(true);
    setCsvUploadStatus('');
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      
      const response = await fetch(`${config.apiUrl}/api/provider/${selectedProvider.id}/upload-insurance-states`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to upload CSV');
      }
      
      const result = await response.json();
      setCsvUploadStatus(`Success! Added ${result.mappings_added} insurance-state mappings.${result.skipped_rows.length > 0 ? ` ${result.skipped_rows.length} rows were skipped.` : ''}`);
      setCsvFile(null);
      // Reset file input
      const fileInput = document.getElementById('csvFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setCsvUploadStatus(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setCsvUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-end gap-2 mb-8">
          <div className="flex flex-row items-end gap-2">
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8 mb-1" />
            <h1 className="hidden md:block font-meno-banner text-base font-bold">
              Update Existing Provider
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

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="font-meno-banner text-2xl font-bold mb-6">Search Provider By Name</h2>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="searchTerm" className="block text-sm font-gibson font-medium text-[#606060] mb-2">
                    Provider Name
                  </label>
                  <input
                    id="searchTerm"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter provider name"
                    className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e06a53] transition-colors disabled:bg-[#E87F6B]/70"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <>
                  <h3 className="font-meno-banner text-xl font-bold mt-8 mb-4">Search Results (Click to Update)</h3>
                  <div className="max-h-[300px] overflow-y-auto border border-[#ACACAD] rounded-lg">
                    {searchResults.map((provider) => (
                      <div 
                        key={provider.id}
                        onClick={() => handleSelectProvider(provider)}
                        className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-[#FDF8F3] ${selectedProvider?.id === provider.id ? 'bg-[#FDF8F3]' : ''}`}
                      >
                        <h4 className="font-bold">{provider.dme_name}</h4>
                        <p className="text-sm">{provider.email}</p>
                        <p className="text-sm text-gray-600">{provider.phone}</p>
                        <p className="text-sm text-gray-600">{provider.dedicated_link}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedProvider && (
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-lg p-8 shadow-sm relative">
                <h2 className="font-meno-banner text-2xl font-bold mb-6">Update Provider Details</h2>
                <button
                  type="button"
                  className="absolute right-8 top-8 border border-[#E87F6B] text-[#E87F6B] font-gibson font-semibold px-4 py-2 rounded hover:bg-[#ffe5e0] transition-colors"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Provider
                </button>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-gibson font-medium text-[#606060] mb-2">
                        Provider Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-gibson font-medium text-[#606060] mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-gibson font-medium text-[#606060] mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                      />
                    </div>
                    <div>
                      <label htmlFor="dedicated_link" className="block text-sm font-gibson font-medium text-[#606060] mb-2">
                        Dedicated Link
                      </label>
                      <input
                        id="dedicated_link"
                        name="dedicated_link"
                        type="url"
                        value={formData.dedicated_link}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e06a53] transition-colors disabled:bg-[#E87F6B]/70"
                    >
                      {isLoading ? 'Updating...' : 'Update Provider Details'}
                    </button>
                  </div>
                </form>

                {/* CSV Upload Form */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-meno-banner text-xl font-bold mb-4">Add Insurance-State Mappings</h3>
                  <p className="text-sm text-[#606060] mb-4 font-gibson">
                    Upload a CSV file with "Insurance" and "State" columns. States can be 2-letter codes or "ALL".
                  </p>
                  
                  {csvUploading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E87F6B] mb-4"></div>
                      <p className="text-[#606060] font-gibson text-sm">Processing your CSV file...</p>
                      <p className="text-[#606060] font-gibson text-xs mt-2">This may take a moment</p>
                    </div>
                  ) : (
                    <form onSubmit={handleCsvUpload}>
                      <div className="mb-4">
                        <label htmlFor="csvFile" className="block text-sm font-gibson font-medium text-[#606060] mb-2">
                          CSV File
                        </label>
                        <input
                          id="csvFile"
                          type="file"
                          accept=".csv"
                          onChange={handleCsvFileChange}
                          className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                        />
                      </div>
                      
                      {csvUploadStatus && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                          csvUploadStatus.includes('Success') 
                            ? 'bg-[#60DFD0]/10 border border-[#60DFD0] text-[#2C8A81]'
                            : 'bg-red-100 border border-red-400 text-red-700'
                        }`}>
                          {csvUploadStatus}
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={!csvFile || csvUploading}
                        className="w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e06a53] transition-colors disabled:bg-[#E87F6B]/70"
                      >
                        {csvUploading ? 'Uploading...' : 'Update Insurance-State Mappings'}
                      </button>
                    </form>
                  )}
                </div>

                {showDeleteModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                      <h3 className="text-lg font-bold mb-4">Are you sure you want to delete this provider?</h3>
                      <p className="mb-6 text-sm text-gray-700">This action cannot be undone.</p>
                      <div className="flex justify-end gap-4">
                        <button
                          className="bg-[#E87F6B] text-white px-4 py-2 rounded hover:bg-[#e06a53] font-gibson font-medium"
                          onClick={handleDeleteProvider}
                          disabled={isLoading}
                        >
                          Yes, Delete
                        </button>
                        <button
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-gibson font-medium"
                          onClick={() => setShowDeleteModal(false)}
                          disabled={isLoading}
                        >
                          No, go back
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 
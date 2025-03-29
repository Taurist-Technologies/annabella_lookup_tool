'use client';

import React, { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsList } from './components/ResultsList';
import { DMEProvider } from './types';

export default function Home() {
  const [results, setResults] = useState<DMEProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isReturningUser, setIsReturningUser] = useState(false);

  const handleSearch = async (formData: {
    state: string;
    insurance_provider: string;
    email: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/search-dme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data);
      setShowResults(true);
      setUserEmail(formData.email);
      setIsReturningUser(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!showResults) {
    return <SearchForm onSubmit={handleSearch} isReturningUser={isReturningUser} userEmail={userEmail} />;
  }

  const hasResults = !loading && !error && results.length > 0;

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E87F6B] border-t-transparent"></div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-end gap-2">
            <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8"/>
            <h1 className={`font-[var(--font-meno-banner)] text-base font-bold ${hasResults ? 'hidden md:block' : 'block'}`}>
              Insurance Lookup Tool
            </h1>
          </div>
          {hasResults && (
            <button 
              onClick={() => setShowResults(false)}
              className="bg-[#E87F6B] text-white font-[var(--font-gibson)] text-sm font-medium px-4 py-2 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
            >
              New Search
            </button>
          )}
        </div>
        {hasResults && (
          <h2 className="font-[var(--font-meno-banner)] text-2xl font-bold mb-6">
            Here are your preferred suppliers
          </h2>
        )}
        
        {!hasResults ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <h3 className="font-[var(--font-meno-banner)] text-xl font-bold text-gray-800 mb-2">
              No Results Found
            </h3>
            <p className="font-[var(--font-gibson)] text-gray-600 mb-6">
              We couldn't find any providers matching your search criteria.
            </p>
            <p className="font-[var(--font-ga-maamli)] text-sm text-gray-500 mb-4">
              Try adjusting your search parameters or
            </p>
            <button 
              onClick={() => setShowResults(false)}
              className="bg-[#E87F6B] text-white font-[var(--font-gibson)] text-sm font-medium px-6 py-3 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
            >
              Start a New Search
            </button>
          </div>
        ) : (
          <ResultsList results={results} />
        )}
      </div>
    </main>
  );
} 
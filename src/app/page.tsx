'use client';

import React, { useState, useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsList } from './components/ResultsList';

interface DMEProvider {
  id: number;
  name: string;
  state: string;
  insurance_providers: string[];
  contact_info: string;
  location: string;
}

export default function Home() {
  const [results, setResults] = useState<DMEProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (formData: {
    state: string;
    insurance_provider: string;
    email: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/search-dme', {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          DME Provider Search
        </h1>
        
        <SearchForm onSubmit={handleSearch} />
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
            {error}
          </div>
        )}
        
        {!loading && !error && results.length > 0 && (
          <ResultsList results={results} />
        )}
      </div>
    </main>
  );
} 
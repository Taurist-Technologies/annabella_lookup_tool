'use client';

import React, { useState, useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsList } from './components/ResultsList';
import { DMEProvider } from './types';
import { config } from './config';

console.log(config.apiUrl);
console.log(config.wordpress.orderAPI);


interface State {
  id: number;
  name: string;
  abbreviation: string;
}

export default function Home() {
  const [results, setResults] = useState<DMEProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [isBreastpumpsFlow, setIsBreastpumpsFlow] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Processing your request...');

  useEffect(() => {
    // Fetch states data
    const fetchStates = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/states`);
        if (response.ok) {
          const statesData = await response.json();
          setStates(statesData);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    fetchStates();
  }, []);

  const handleSearch = async (formData: {
    state: string;
    insurance_provider: string;
    email: string;
  }) => {
    setLoading(true);
    setError(null);
    setIsBreastpumpsFlow(false);
    setLoadingStatus('Processing your request...');
    try {
      const response = await fetch(`${config.apiUrl}/api/search-dme`, {
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
      console.log('API response:', data);
      
      // Check if Breastpumps.com is in the results
      const hasBreastpumps = data.some((provider: DMEProvider) => 
        provider.dme_name.toLowerCase() === 'breastpumps.com'
      );
      
      if (hasBreastpumps) {
        setIsBreastpumpsFlow(true);
        setLoadingStatus('Connecting to insurance provider...');
        console.log('Breastpumps.com found in results, making WordPress API call...');
        
        try {
          // Make the WordPress API call with the state abbreviation
          const wpResponse = await fetch(
            `${config.wordpress.endpoints.providersByState(formData.state)}`
          );
          
          if (wpResponse.ok) {
            const wpData = await wpResponse.json();
            console.log('WordPress API response:', wpData);
            
            // Filter for matching insurance provider names
            const matchingProviders = wpData.providers.filter((item: any) => 
              item.provider_display_name.toLowerCase() === formData.insurance_provider.toLowerCase()
            );
            
            console.log(`Matched providers for ${formData.insurance_provider}:`, matchingProviders);
            
            // If we have a matching provider, make the order API call
            if (matchingProviders.length > 0 && matchingProviders[0].id) {
              setLoadingStatus('Confirming your information...');
              console.log('Making order API call with provider ID:', matchingProviders[0].id);
              
              // Find the full state name from abbreviation
              const stateData = states.find(state => state.abbreviation === formData.state);
              const fullStateName = stateData ? stateData.name : formData.state;
              
              // Create the order data
              const unixTimestamp = Math.floor(Date.now() / 1000);
              const orderData = {
                extId: `${unixTimestamp}-ANB`,
                firstName: "",
                lastName: "",
                momEmail: formData.email,
                provider: matchingProviders[0].id,
                momAddressState: fullStateName,
                referralDetails: ""
              };
              
              try {
                const orderResponse = await fetch(`${config.wordpress.endpoints.order}`, {
                  method: 'POST',
                  headers: {
                    'X-HBE-API-Key': `${config.wordpress.orderAPI}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(orderData)
                });
                
                if (orderResponse.ok) {
                  const orderResult = await orderResponse.json();
                  console.log(orderData);
                  console.log('Order API response:', orderResult);
                  
                  // Check if resume_token exists and redirect
                  if (orderResult.resume_token) {
                    setLoadingStatus('Redirecting to Insurance Portal...');
                    console.log('Resume token received, redirecting to WordPress site...');
                    
                    // Small delay to show the final status before redirect
                    setTimeout(() => {
                      window.location.href = `${config.wordpress.endpoints.redirect(orderResult.resume_token)}`;
                    }, 1000);
                  } else {
                    console.error('No resume_token in order API response');
                    setIsBreastpumpsFlow(false);
                    setLoading(false);
                    // Still show results even if redirect failed
                    setResults(data);
                    setShowResults(true);
                    setUserEmail(formData.email);
                    setIsReturningUser(true);
                  }
                } else {
                  console.error('Order API call failed:', orderResponse.status, orderResponse.statusText);
                  setIsBreastpumpsFlow(false);
                  setLoading(false);
                  // Still show results even if order failed
                  setResults(data);
                  setShowResults(true);
                  setUserEmail(formData.email);
                  setIsReturningUser(true);
                }
              } catch (orderError) {
                console.error('Error making order API call:', orderError);
                setIsBreastpumpsFlow(false);
                setLoading(false);
                // Still show results even if order failed
                setResults(data);
                setShowResults(true);
                setUserEmail(formData.email);
                setIsReturningUser(true);
              }
            } else {
              // No matching provider found
              console.log('No matching provider found in WordPress API response');
              setIsBreastpumpsFlow(false);
              setLoading(false);
              // Still show original results
              setResults(data);
              setShowResults(true);
              setUserEmail(formData.email);
              setIsReturningUser(true);
            }
          } else {
            console.error('WordPress API call failed:', wpResponse.status, wpResponse.statusText);
            setIsBreastpumpsFlow(false);
            setLoading(false);
            // Still show results even if WordPress API failed
            setResults(data);
            setShowResults(true);
            setUserEmail(formData.email);
            setIsReturningUser(true);
          }
        } catch (wpError) {
          console.error('Error calling WordPress API:', wpError);
          setIsBreastpumpsFlow(false);
          setLoading(false);
          // Still show results even if WordPress API failed
          setResults(data);
          setShowResults(true);
          setUserEmail(formData.email);
          setIsReturningUser(true);
        }
      } else {
        // Normal flow - no Breastpumps.com in results
        setResults(data);
        setShowResults(true);
        setUserEmail(formData.email);
        setIsReturningUser(true);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsBreastpumpsFlow(false);
      setLoading(false);
    }
  };

  // Always render the homepage link
  return (
    <>
      {/* Loading UI - Always rendered, controlled by loading state */}
      {loading && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${
          isBreastpumpsFlow ? 'bg-white' : 'bg-black bg-opacity-50'
        }`}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E87F6B] border-t-transparent"></div>
            {isBreastpumpsFlow && (
              <p className="font-gibson text-gray-700 text-lg">{loadingStatus}</p>
            )}
          </div>
        </div>
      )}
      
      { !showResults ? (
        <SearchForm onSubmit={handleSearch} isReturningUser={isReturningUser} userEmail={userEmail} />
      ) : (
        // ... existing main/results code ...
        <main className="min-h-screen bg-[#FDF8F3]">
          {error && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50">
              {error}
            </div>
          )}
          <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8 mt-6">
              <div className="flex items-end gap-2">
                <img src="/images/logo.png" alt="Annabella Logo" className="h-6 md:h-8 mb-1"/>
                <h1 className={`font-meno-banner text-base font-bold ${!loading && !error && results.length > 0 ? 'hidden md:block' : 'block'}`}>Insurance Lookup Tool</h1>
              </div>
              {!loading && !error && results.length > 0 && (
                <button 
                  onClick={() => setShowResults(false)}
                  className="bg-[#E87F6B] text-white font-gibson text-sm font-medium px-4 py-2 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
                >
                  New Search
                </button>
              )}
            </div>
            {!loading && !error && results.length > 0 && (
              <h2 className="font-meno-banner text-2xl font-bold mb-6">
                Here are your preferred suppliers
              </h2>
            )}
            {!(!loading && !error && results.length > 0) ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <h3 className="font-meno-banner text-xl font-bold text-gray-800 mb-2">
                  No Results Found
                </h3>
                <p className="font-gibson text-gray-600 mb-6">
                  We couldn't find any providers matching your search criteria.
                </p>
                <p className="font-[var(--font-ga-maamli)] text-sm text-gray-500 mb-4">
                  Try adjusting your search parameters or
                </p>
                <button 
                  onClick={() => setShowResults(false)}
                  className="bg-[#E87F6B] text-white font-gibson text-sm font-medium px-6 py-3 rounded border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
                >
                  Start a New Search
                </button>
              </div>
            ) : (
              <ResultsList results={results} />
            )}
          </div>
        </main>
      )}
    </>
  );
} 
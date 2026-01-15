'use client';

import React, { useState } from 'react';
import { DMEProvider } from '../types';
import { config } from '../config';

interface State {
  id: number;
  name: string;
  abbreviation: string;
}

interface ResultsListProps {
  results: DMEProvider[];
  searchData?: {
    state: string;
    insurance_provider: string;
    email: string;
    session_id?: string;
  };
  trackedProviders?: Set<number>;
  onProviderTracked?: (providerId: number) => void;
  states?: State[];
}

export function ResultsList({ results, searchData, trackedProviders, onProviderTracked, states }: ResultsListProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState('');

  const trackClick = async (provider: DMEProvider, clickType: string = 'manual') => {
    try {
      if (!searchData) {
        console.warn('Search data not available for click tracking');
        return;
      }

      // Check if this provider has already been tracked in this session
      if (trackedProviders && trackedProviders.has(provider.id)) {
        console.log(`Skipping duplicate tracking for provider ${provider.dme_name} (ID: ${provider.id}) - already tracked in this session`);
        return;
      }

      const clickData = {
        provider_id: provider.id,
        user_email: searchData.email,
        search_state: searchData.state,
        search_insurance: searchData.insurance_provider,
        click_type: clickType,
        session_id: searchData.session_id || `session_${Date.now()}`,
        user_agent: navigator.userAgent,
        referrer: document.referrer || window.location.origin,
      };
      console.log('Click data:', clickData);

      // Mark as tracked before making the API call
      if (onProviderTracked) {
        onProviderTracked(provider.id);
      }

      // Fire and forget - don't block the user's click
      fetch(`${config.apiUrl}/api/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clickData),
      }).catch((error) => {
        console.error('Failed to track click:', error);
        // Don't show error to user - this is just analytics
      });
    } catch (error) {
      console.error('Error preparing click tracking:', error);
    }
  };

  // Handle breastpumps.com WordPress redirect flow
  const handleBreastpumpsRedirect = async (provider: DMEProvider) => {
    if (!searchData) {
      console.warn('Search data not available for breastpumps redirect');
      window.open(provider.dedicated_link, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsRedirecting(true);
    setRedirectStatus('Connecting to insurance provider...');

    try {
      // Step 1: Get providers by state from WordPress
      const wpResponse = await fetch(
        config.wordpress.endpoints.providersByState(searchData.state)
      );

      if (!wpResponse.ok) {
        console.error('WordPress API call failed:', wpResponse.status);
        throw new Error('WordPress API failed');
      }

      const wpData = await wpResponse.json();
      console.log('WordPress API response:', wpData);

      // Step 2: Find matching insurance provider
      const matchingProviders = wpData.providers.filter((item: any) =>
        item.provider_display_name.toLowerCase() === searchData.insurance_provider.toLowerCase()
      );

      console.log(`Matched providers for ${searchData.insurance_provider}:`, matchingProviders);

      if (matchingProviders.length === 0 || !matchingProviders[0].id) {
        console.log('No matching provider found in WordPress API response');
        throw new Error('No matching provider');
      }

      // Step 3: Create order
      setRedirectStatus('Confirming your information...');

      // Find full state name from abbreviation
      const stateData = states?.find(state => state.abbreviation === searchData.state);
      const fullStateName = stateData ? stateData.name : searchData.state;

      const unixTimestamp = Math.floor(Date.now() / 1000);
      const orderData = {
        extId: `${unixTimestamp}-ANB`,
        firstName: "",
        lastName: "",
        momEmail: searchData.email,
        provider: matchingProviders[0].id,
        momAddressState: fullStateName,
        referralDetails: ""
      };

      const orderResponse = await fetch(config.wordpress.endpoints.order, {
        method: 'POST',
        headers: {
          'X-HBE-API-Key': config.wordpress.orderAPI,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        console.error('Order API call failed:', orderResponse.status);
        throw new Error('Order API failed');
      }

      const orderResult = await orderResponse.json();
      console.log('Order API response:', orderResult);

      // Step 4: Redirect if we have a resume token
      if (orderResult.resume_token) {
        setRedirectStatus('Redirecting to Insurance Portal...');
        setTimeout(() => {
          window.location.href = config.wordpress.endpoints.redirect(orderResult.resume_token);
        }, 500);
      } else {
        console.error('No resume_token in order API response');
        throw new Error('No resume token');
      }
    } catch (error) {
      console.error('Breastpumps redirect flow failed:', error);
      // Silently fall back to dedicated link
      setIsRedirecting(false);
      setRedirectStatus('');
      window.open(provider.dedicated_link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleProviderClick = async (provider: DMEProvider) => {
    // Track the click
    await trackClick(provider, 'manual');

    // Check if this is breastpumps.com - use WordPress redirect flow
    if (provider.dme_name.toLowerCase() === 'breastpumps.com') {
      await handleBreastpumpsRedirect(provider);
    } else {
      // Open the link normally for other providers
      window.open(provider.dedicated_link, '_blank', 'noopener,noreferrer');
    }
  };


  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No providers found matching your criteria.
      </div>
    );
  }

  return (
    <>
      {/* Loading overlay for breastpumps.com redirect */}
      {isRedirecting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E87F6B] border-t-transparent"></div>
            <p className="font-gibson text-gray-700 text-lg">{redirectStatus}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((provider) => (
        <div
          key={provider.id}
          className="bg-white rounded-lg p-4 flex flex-col h-full"
        >
          <div className="flex-grow space-y-3">
            <h3 className="font-meno-banner text-lg font-bold text-black">
              {provider.dme_name}
            </h3>
            <div className="space-y-1">
              <p className="font-[var(--font-ga-maamli)] text-sm">
                <span className="font-bold">Phone Number:</span> {provider.phone}
              </p>
              <p className="font-[var(--font-ga-maamli)] text-sm">
                <span className="font-bold">Email:</span> {provider.email}
              </p>
            </div>
            <div className="min-h-[120px] space-y-2 flex flex-col">
              {provider.resupply_available && (
                <div className="flex items-center justify-between">
                  <span className="font-gibson font-normal text-sm">Resupply Available</span>
                  <span className="text-base text-[#60DFD0]">✓</span>
                </div>
              )}
              {provider.accessories_available && (
                <div className="flex items-center justify-between">
                  <span className="font-gibson font-normal text-sm">Accessories Available</span>
                  <span className="text-base text-[#60DFD0]">✓</span>
                </div>
              )}
              {provider.lactation_services_available && (
                <div className="flex items-center justify-between">
                  <span className="font-gibson font-normal text-sm">Lactation Services Available</span>
                  <span className="text-base text-[#60DFD0]">✓</span>
                </div>
              )}
            </div>
          </div>
            <button
              onClick={() => handleProviderClick(provider)}
              className="block w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e96c54] transition-colors mt-4 text-center cursor-pointer border-none"
            >
              APPLY NOW
            </button>
          </div>
        ))}
      </div>
    </>
  );
} 
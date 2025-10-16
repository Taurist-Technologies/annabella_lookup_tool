'use client';

import React from 'react';
import { DMEProvider } from '../types';
import { config } from '../config';

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
}

export function ResultsList({ results, searchData, trackedProviders, onProviderTracked }: ResultsListProps) {
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

  const handleProviderClick = async (provider: DMEProvider) => {
    // Track the click
    await trackClick(provider, 'manual');

    // Open the link - let the browser handle it normally
    window.open(provider.dedicated_link, '_blank', 'noopener,noreferrer');
  };


  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No providers found matching your criteria.
      </div>
    );
  }

  return (
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
  );
} 
'use client';

import React from 'react';
import { DMEProvider } from '../types';

interface ResultsListProps {
  results: DMEProvider[];
}

export function ResultsList({ results }: ResultsListProps) {
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
          <a 
            href={provider.dedicated_link}
            target="_blank"
            rel="noopener noreferrer" 
            className="block w-full bg-[#E87F6B] text-white font-gibson text-base py-3 rounded hover:bg-[#e96c54] transition-colors mt-4 text-center"
          >
            APPLY NOW
          </a>
        </div>
      ))}
    </div>
  );
} 
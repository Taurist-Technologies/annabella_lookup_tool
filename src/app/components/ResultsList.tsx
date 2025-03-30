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
          className="bg-white rounded-lg p-4 space-y-3"
        >
          <h3 className="font-[var(--font-meno-banner)] text-lg font-bold text-black">
            {provider.company_name}
          </h3>
          <div className="space-y-1">
            <p className="font-[var(--font-ga-maamli)] text-sm">
              <span className="font-bold">Phone Number:</span> {provider.phone_number}
            </p>
            <p className="font-[var(--font-ga-maamli)] text-sm">
              <span className="font-bold">Email:</span> {provider.email}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-gibson)] font-light text-sm">Multiple Pump Models</span>
              <span className={`text-base ${provider.multiple_pump_models ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                {provider.multiple_pump_models ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-gibson)] font-light text-sm">Upgrade Pumps Available</span>
              <span className={`text-base ${provider.upgrade_pumps_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                {provider.upgrade_pumps_available ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-gibson)] font-light text-sm">Resupply Available</span>
              <span className={`text-base ${provider.resupply_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                {provider.resupply_available ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-gibson)] font-light text-sm">Accessories Available</span>
              <span className={`text-base ${provider.accessories_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                {provider.accessories_available ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-[var(--font-gibson)] font-light text-sm">Location Services Available</span>
              <span className={`text-base ${provider.lactation_services_available ? 'text-[#60DFD0]' : 'text-[#DE2A2A]'}`}>
                {provider.lactation_services_available ? '✓' : '✗'}
              </span>
            </div>
          </div>
          <a 
            href={provider.weblink}
            target="_blank"
            rel="noopener noreferrer" 
            className="block w-full bg-[#E87F6B] text-white font-[var(--font-gibson)] text-base py-3 rounded hover:bg-[#e96c54] transition-colors mt-4 text-center"
          >
            APPLY NOW
          </a>
        </div>
      ))}
    </div>
  );
} 
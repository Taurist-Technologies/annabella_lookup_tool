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
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Results</h2>
      <div className="space-y-4">
        {results.map((provider) => (
          <div
            key={provider.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {provider.company_name}
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {provider.phone_number}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {provider.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Website:</span>{' '}
                <a href={provider.weblink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {provider.weblink}
                </a>
              </p>
              {/* <p className="text-gray-600">
                <span className="font-medium">State:</span> {provider.state}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Insurance Providers:</span>{' '}
                {provider.insurance_providers.join(', ')}
              </p> */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${provider.multiple_pump_models ? 'text-green-600' : 'text-red-500'}`}>
                    {provider.multiple_pump_models ? '✓ ' : '✗ '}
                  </span>
                  <span className="font-medium"> Multiple pump models</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${provider.upgrade_pumps_available ? 'text-green-600' : 'text-red-500'}`}>
                    {provider.upgrade_pumps_available ? '✓ ' : '✗ '}
                  </span>
                  <span className="font-medium"> Pump upgrades available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${provider.resupply_available ? 'text-green-600' : 'text-red-500'}`}>
                    {provider.resupply_available ? '✓ ' : '✗ '}
                  </span>
                  <span className="font-medium"> Resupply available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${provider.accessories_available ? 'text-green-600' : 'text-red-500'}`}>
                    {provider.accessories_available ? '✓ ' : '✗ '}
                  </span>
                  <span className="font-medium"> Accessories available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${provider.lactation_services_available ? 'text-green-600' : 'text-red-500'}`}>
                    {provider.lactation_services_available ? '✓ ' : '✗ '}
                  </span>
                  <span className="font-medium"> Lactation services</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
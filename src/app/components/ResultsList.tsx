'use client';

import React from 'react';

interface DMEProvider {
  id: number;
  name: string;
  state: string;
  insurance_providers: string[];
  contact_info: string;
  location: string;
}

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
      <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
      <div className="space-y-4">
        {results.map((provider) => (
          <div
            key={provider.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {provider.name}
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium">Location:</span> {provider.location}
              </p>
              <p>
                <span className="font-medium">Contact:</span> {provider.contact_info}
              </p>
              <p>
                <span className="font-medium">State:</span> {provider.state}
              </p>
              <p>
                <span className="font-medium">Insurance Providers:</span>{' '}
                {provider.insurance_providers.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
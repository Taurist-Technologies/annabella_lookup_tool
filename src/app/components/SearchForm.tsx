'use client';

import React, { useState, useEffect } from 'react';

interface State {
  id: number;
  name: string;
  abbreviation: string;
}

interface InsuranceProvider {
  id: number;
  name: string;
}

interface SearchFormProps {
  onSubmit: (data: {
    state: string;
    insurance_provider: string;
    email: string;
  }) => void;
}

export function SearchForm({ onSubmit }: SearchFormProps) {
  const [states, setStates] = useState<State[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [formData, setFormData] = useState({
    state: '',
    insurance_provider: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statesRes, insuranceRes] = await Promise.all([
          fetch('http://localhost:8000/states'),
          fetch('http://localhost:8000/insurance-providers'),
        ]);

        if (!statesRes.ok || !insuranceRes.ok) {
          throw new Error('Failed to fetch form data');
        }

        const [statesData, insuranceData] = await Promise.all([
          statesRes.json(),
          insuranceRes.json(),
        ]);

        setStates(statesData);
        setInsuranceProviders(insuranceData);
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="state"
          className="block text-sm font-medium text-gray-700"
        >
          State
        </label>
        <select
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a state</option>
          {states.map((state) => (
            <option key={state.id} value={state.abbreviation}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="insurance_provider"
          className="block text-sm font-medium text-gray-700"
        >
          Insurance Provider
        </label>
        <select
          id="insurance_provider"
          name="insurance_provider"
          value={formData.insurance_provider}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select an insurance provider</option>
          {insuranceProviders.map((provider) => (
            <option key={provider.id} value={provider.name}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Search
      </button>
    </form>
  );
} 
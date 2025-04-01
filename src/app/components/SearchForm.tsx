'use client';

import React, { useState, useEffect } from 'react';
import { config } from '../config';

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
  isReturningUser?: boolean;
  userEmail?: string;
}

export function SearchForm({ onSubmit, isReturningUser = false, userEmail = '' }: SearchFormProps) {
  const [states, setStates] = useState<State[]>([]);
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [formData, setFormData] = useState({
    state: '',
    insurance_provider: '',
    email: userEmail,
  });
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(isReturningUser);
  const [showTermsError, setShowTermsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statesRes, insuranceRes] = await Promise.all([
          fetch(`${config.apiUrl}/api/states`),
          fetch(`${config.apiUrl}/api/insurance-providers`),
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
    if (!isReturningUser && !termsAccepted) {
      setShowTermsError(true);
      return;
    }
    onSubmit({
      ...formData,
      email: isReturningUser ? userEmail : formData.email,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setTermsAccepted(e.target.checked);
      setShowTermsError(false);
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 w-1/2 mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDF8F3] flex flex-col md:flex-row justify-between items-stretch">
      <div className="flex flex-col justify-start md:justify-center flex-1 px-6 py-6 md:px-[100px] md:py-0">
        <div className="flex flex-row items-end gap-2 mb-4">
          <img src="/images/logo.png" alt="Annabella Logo" className="h-5 md:h-8" />
          <h1 className="font-meno-banner text-[14px] md:text-[16px] font-bold leading-none">
            Insurance Lookup Tool
          </h1>
        </div>

        <div className="bg-white rounded-lg p-5 space-y-5 w-full md:max-w-[700px] shadow-sm mt-8">
          <h2 className="font-meno-banner text-[24px] md:text-[38px] font-bold leading-[1.2] text-black">
            Find a preferred supplier
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2">
                <label htmlFor="state" className="font-gibson text-[13px] md:text-[15px] font-medium text-[#606060]">
                  Select the state of your insurer
                </label>
              </div>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] md:text-base focus:border-[#E87F6B] focus:ring-[#E87F6B]"
              >
                <option value="">State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.abbreviation}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2">
                <label htmlFor="insurance_provider" className="font-gibson text-[13px] md:text-[15px] font-medium text-[#606060]">
                  Choose your insurance provider
                </label>
              </div>
              <select
                id="insurance_provider"
                name="insurance_provider"
                value={formData.insurance_provider}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] md:text-base focus:border-[#E87F6B] focus:ring-[#E87F6B]"
              >
                <option value="">Insurance</option>
                {insuranceProviders.map((provider) => (
                  <option key={provider.id} value={provider.name}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {!isReturningUser && (
              <>
                <div>
                  <div className="mb-2">
                    <label htmlFor="email" className="font-gibson text-[13px] md:text-[15px] font-medium text-[#606060]">
                      Enter your email
                    </label>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email"
                    className="w-full px-4 py-3 border border-[#ACACAD] rounded-[14.7px] font-gibson text-[14px] md:text-base bg-[#FCFCFC] focus:border-[#E87F6B] focus:ring-[#E87F6B]"
                  />
                </div>

                <div className="flex flex-row gap-2 items-start pt-1">
                  <div className="relative w-4 h-4">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={handleChange}
                      className="appearance-none w-4 h-4 border border-[#ACACAD] rounded checked:bg-[#E87F6B] checked:border-[#E87F6B] transition-colors"
                    />
                    <svg 
                      className="absolute top-0 left-0 w-4 h-4 pointer-events-none hidden peer-checked:block text-white" 
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M13.3334 4L6.00008 11.3333L2.66675 8" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="terms" className="font-gibson text-[10px] md:text-[12px] font-medium text-[#606060]">
                      Agree to email terms and conditions
                    </label>
                    {showTermsError && (
                      <span className="text-red-500 text-[10px] md:text-[11px] font-gibson mt-1">
                        Please accept the terms and conditions
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-[#E87F6B] text-white font-gibson text-[14px] md:text-[16px] font-medium py-3 rounded-[6.3px] border border-[#E87F6B] hover:bg-[#e06a53] transition-colors uppercase mt-2"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Image section - Shown on both mobile and desktop with different styles */}
      <div className="md:w-[534px] md:h-screen relative">
        <img 
          src="/images/hero-image.png" 
          alt="Annabella Hero" 
          className="w-full h-[300px] md:h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#6B1111] to-transparent">
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 p-4 text-white">
            <h2 className="font-meno-banner text-[24px] md:text-[35px] font-[700] leading-[1.26] text-center">
              The ONLY pump that mimics your baby's tongue.
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-[#E87F6B] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-gibson text-[12px] md:text-[20.5px] leading-none max-w-[200px] md:max-w-none text-center md:text-left">
                Shown to increase average milk expression by 50%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 0L14.329 6.67295L21.6074 7.63729L16.3037 12.7646L17.6579 20L11 16.673L4.34215 20L5.69635 12.7646L0.392658 7.63729L7.67101 6.67295L11 0Z" fill="white"/>
                  </svg>
                ))}
              </div>
              <p className="font-gibson text-[16px] md:text-[24.7px] leading-[1.33] tracking-[0.01em]">
                Trusted by 10k+ Moms
              </p>
            </div>
            <div className="flex gap-3 mt-3">
              <a 
                href="https://annabella-pump.com/collections/all-products"
                className="bg-[#E87F6B] text-white font-gibson text-[12px] md:text-[14.7px] font-medium uppercase px-4 md:px-[55px] py-2 md:py-[10.6px] rounded-[4.6px] border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
              >
                Shop Collection
              </a>
              <a
                href="https://annabella-pump.com/pages/contact"
                className="bg-[#E87F6B] text-white font-gibson text-[12px] md:text-[14.7px] font-medium uppercase px-4 md:px-[55px] py-2 md:py-[10.6px] rounded-[4.6px] border border-[#E87F6B] hover:bg-[#e06a53] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
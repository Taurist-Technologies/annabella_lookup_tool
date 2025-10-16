'use client';

import React, { useState, useEffect } from 'react';
import { config } from '../config';

interface ClickAnalytics {
  provider_id: number;
  provider_name: string;
  total_clicks: number;
  manual_clicks: number;
  auto_redirects: number;
  unique_users: number;
  avg_clicks_per_user: number;
  top_states: string[];
  top_insurances: string[];
}

interface ClickSummary {
  total_clicks_all_time: number;
  clicks_last_30_days: number;
  manual_clicks_last_30_days: number;
  auto_redirects_last_30_days: number;
  unique_users_last_30_days: number;
  period: string;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<ClickAnalytics[]>([]);
  const [summary, setSummary] = useState<ClickSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);

      const summaryResponse = await fetch(`${config.apiUrl}/api/analytics/clicks/summary`);

      if (!summaryResponse.ok) {
        throw new Error(`Failed to fetch summary: ${summaryResponse.status} ${summaryResponse.statusText}`);
      }

      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch summary data';
      setSummaryError(errorMessage);
      console.error('Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchDetailedAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      const analyticsResponse = await fetch(`${config.apiUrl}/api/analytics/clicks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dateRange),
      });

      if (!analyticsResponse.ok) {
        throw new Error(`Failed to fetch analytics: ${analyticsResponse.status} ${analyticsResponse.statusText}`);
      }

      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch detailed analytics';
      setAnalyticsError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (showDetailedAnalytics) {
      fetchDetailedAnalytics();
    }
  }, [dateRange, showDetailedAnalytics]);

  const handleDateChange = (field: string, value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadDetailedAnalytics = () => {
    setShowDetailedAnalytics(true);
  };

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#E87F6B] border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading analytics summary...</span>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Summary Error:</strong> {summaryError}
        <button
          onClick={fetchSummary}
          className="ml-4 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-500">Total Clicks (All Time)</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.total_clicks_all_time.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-500">Clicks (Last 30 Days)</h3>
            <p className="text-2xl font-bold text-gray-900">{summary.clicks_last_30_days.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-500">Manual Clicks</h3>
            <p className="text-2xl font-bold text-blue-600">{summary.manual_clicks_last_30_days.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-500">Auto Redirects</h3>
            <p className="text-2xl font-bold text-orange-600">{summary.auto_redirects_last_30_days.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-sm font-medium text-gray-500">Unique Users</h3>
            <p className="text-2xl font-bold text-green-600">{summary.unique_users_last_30_days.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Load Detailed Analytics Button or Analytics Section */}
      {!showDetailedAnalytics ? (
        <div className="bg-white rounded-lg p-8 border text-center">
          <h3 className="text-lg font-semibold mb-4">Detailed Provider Analytics</h3>
          <p className="text-gray-600 mb-6">
            View detailed click analytics for each provider, including breakdowns by state and insurance.
          </p>
          <button
            onClick={handleLoadDetailedAnalytics}
            className="bg-[#E87F6B] text-white font-gibson text-base py-3 px-6 rounded hover:bg-[#e06a53] transition-colors"
          >
            Load Detailed Analytics
          </button>
        </div>
      ) : (
        <>
          {/* Date Range Selector */}
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-lg font-semibold mb-4">Date Range Filter</h3>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => handleDateChange('start_date', e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => handleDateChange('end_date', e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Analytics Error Display */}
          {analyticsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Analytics Error:</strong> {analyticsError}
              <button
                onClick={fetchDetailedAnalytics}
                className="ml-4 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Provider Analytics Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Provider Click Analytics</h3>
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#E87F6B] border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading detailed analytics...</span>
              </div>
            ) : analytics.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No click data found for the selected date range.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Clicks</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Manual</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Auto Redirect</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unique Users</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg/User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top States</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Insurances</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.map((item) => (
                      <tr key={item.provider_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{item.provider_name}</td>
                        <td className="px-4 py-3 text-right">{item.total_clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-blue-600">{item.manual_clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-orange-600">{item.auto_redirects.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600">{item.unique_users.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{item.avg_clicks_per_user.toFixed(1)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.top_states.slice(0, 3).map((state) => (
                              <span key={state} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {state}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs">
                            {item.top_insurances.slice(0, 2).map((insurance) => (
                              <div key={insurance} className="text-xs text-gray-600 truncate">
                                {insurance}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

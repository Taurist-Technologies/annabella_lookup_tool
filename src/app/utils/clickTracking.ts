// Utility function for tracking clicks
import { config } from '../config';

export interface TrackClickParams {
  provider_id: number;
  provider_name?: string;
  user_email: string;
  search_state: string;
  search_insurance: string;
  click_type: 'manual' | 'auto_redirect';
  session_id?: string;
}

export const trackProviderClick = async (params: TrackClickParams): Promise<boolean> => {
  try {
    const clickData = {
      provider_id: params.provider_id,
      user_email: params.user_email,
      search_state: params.search_state,
      search_insurance: params.search_insurance,
      click_type: params.click_type,
      session_id: params.session_id || `session_${Date.now()}`,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      referrer: typeof document !== 'undefined' ? (document.referrer || window.location.origin) : 'Unknown',
    };

    const response = await fetch(`${config.apiUrl}/api/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clickData),
    });

    if (response.ok) {
      console.log(`Click tracked successfully for ${params.provider_name || 'provider'} (${params.click_type})`);
      return true;
    } else {
      console.error('Failed to track click:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error tracking click:', error);
    return false;
  }
};

// Helper to find provider ID by name from search results
export const findProviderIdByName = (results: any[], providerName: string): number | null => {
  const provider = results.find(p => 
    p.dme_name?.toLowerCase() === providerName.toLowerCase()
  );
  return provider?.id || null;
};

// Generate session ID that persists for the user's visit
export const getSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('dme_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('dme_session_id', sessionId);
    }
    return sessionId;
  }
  return `session_${Date.now()}`;
};

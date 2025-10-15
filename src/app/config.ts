const wordpressBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL || 'https://insurance-checker.annabella-pump.com';
const xHbeApiKey = process.env.NEXT_PUBLIC_X_HBE_API_KEY || '1234567890';
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  features: {
    beta: process.env.NEXT_PUBLIC_FEATURE_FLAG_BETA === 'true',
  },
  api: {
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    cacheMaxAge: parseInt(process.env.NEXT_PUBLIC_CACHE_MAX_AGE || '0', 10),
  },
  wordpress: {
    baseUrl: wordpressBaseUrl,
    orderAPI: xHbeApiKey,
    endpoints: {
      providersByState: (state: string) => `${wordpressBaseUrl}/wp-json/hbe/v1/providers-by-state/${state}`,
      order: `${wordpressBaseUrl}/wp-json/hbe/v1/order`,
      redirect: (token: string) => `${wordpressBaseUrl}/?gf_token=${token}`
    }
  },
} 
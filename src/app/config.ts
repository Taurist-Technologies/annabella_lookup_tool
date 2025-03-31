export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  features: {
    beta: process.env.NEXT_PUBLIC_FEATURE_FLAG_BETA === 'true',
  },
  api: {
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    cacheMaxAge: parseInt(process.env.NEXT_PUBLIC_CACHE_MAX_AGE || '0', 10),
  },
} 
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_APP_ENV: 'development' | 'production';
    // Set to "true" to run the app with dummy data (no real Supabase calls).
    EXPO_PUBLIC_USE_MOCK: string;
  }
}

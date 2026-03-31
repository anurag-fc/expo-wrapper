// App-level auth types — decoupled from Supabase's internal types.
// This means swapping auth providers in the future only touches the service layer.

export interface AppUser {
  id: string;
  email: string;
  created_at: string;
}

export interface AppSession {
  user: AppUser;
  access_token: string;
  expires_at: number;
}

export type AuthProvider = 'google' | 'apple';

// This file mirrors your Supabase database schema.
// Regenerate it anytime with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          data: Json | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          body: string;
          data?: Json | null;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          token: string;
          platform: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          source: string | null;
          total_lessons: number;
          goal_date: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          category: string;
          source?: string | null;
          total_lessons?: number;
          goal_date?: string | null;
        };
        Update: {
          name?: string;
          category?: string;
          source?: string | null;
          total_lessons?: number;
          goal_date?: string | null;
        };
        Relationships: [];
      };
      progress_logs: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          lessons_done: number;
          logged_at: string;
        };
        Insert: {
          user_id: string;
          skill_id: string;
          lessons_done?: number;
          logged_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      skill_stats: {
        Row: {
          skill_id: string;
          completed_lessons: number;
          is_completed: boolean;
          completed_at: string | null;
          star_rating: number | null;
        };
        Insert: {
          skill_id: string;
          completed_lessons?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          star_rating?: number | null;
        };
        Update: {
          completed_lessons?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          star_rating?: number | null;
        };
        Relationships: [];
      };
      user_stats: {
        Row: {
          user_id: string;
          xp: number;
          level: number;
          current_streak: number;
          longest_streak: number;
          last_logged_at: string | null;
          timezone: string;
        };
        Insert: {
          user_id: string;
          xp?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_logged_at?: string | null;
          timezone?: string;
        };
        Update: {
          xp?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_logged_at?: string | null;
          timezone?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience helpers — use these throughout the app instead of Database['public']['Tables']['x']['Row']
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

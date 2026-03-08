import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Child {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
  created_at: string;
}

export interface ReadingLog {
  id: string;
  user_id: string;
  child_id: string;
  book_title: string;
  reading_date: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export interface GrowthRecord {
  id: string;
  child_id: string;
  record_date: string;
  height_cm: number;
  weight_kg: number;
  status: string;
  created_at: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  age_category: '0-3' | '4-6' | '7-12';
  theme: string;
  image_url: string;
  created_at: string;
}

export interface ActivityPhoto {
  id: string;
  user_id: string;
  child_id: string | null;
  photo_url: string;
  storage_path?: string | null;
  caption: string;
  activity_date: string;
  created_at: string;
}

export interface ImmunizationRecord {
  id: string;
  child_id: string;
  vaccine_name: string;
  scheduled_date: string;
  completed: boolean;
  completed_date: string | null;
  notes: string;
  created_at: string;
}

export interface MPASIRecipe {
  id: string;
  title: string;
  age_group: '6-8' | '8-10' | '10-12';
  category: string;
  ingredients: string;
  instructions: string;
  nutrition_info: string;
  allergenic_warning: string;
  prep_time_minutes: number;
  servings: number;
  created_at: string;
}

export interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface ChildAdminView {
  id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female';
  user_id: string;
  user_profiles: Pick<UserProfile, 'email' | 'full_name'> | null;
}

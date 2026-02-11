// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Você encontra essas chaves no painel do Supabase em Project Settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

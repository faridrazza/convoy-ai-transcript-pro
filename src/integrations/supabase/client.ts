// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cvvgaumlzohenrlrknad.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dmdhdW1sem9oZW5ybHJrbmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTUyMjEsImV4cCI6MjA2ODM5MTIyMX0.v3KeWtG2XVyM-Vrc9HyeCjliR0_XRVIkgqoZ4xVqBVI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
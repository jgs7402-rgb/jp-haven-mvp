import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mgqnadogbqjmemzneprt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncW5hZG9nYnFqbWVtem5lcHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTE1MTAsImV4cCI6MjA3OTM2NzUxMH0.vIcaVQfL9j1922jWC07pC3zq57GHbmCXI7vrpGRxYvc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kyxooovnmfhydtrxfdga.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5eG9vb3ZubWZoeWR0cnhmZGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTMyNjcsImV4cCI6MjA2Njk2OTI2N30.V-Vnb_li-_Dzmb_cxnz91dy1j5DQWWfmo_3WViFR9Ao';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

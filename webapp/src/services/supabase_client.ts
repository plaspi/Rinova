import { createClient } from '@supabase/supabase-js'

// Vite richiede che le variabili d'ambiente inizino con VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Mancano le variabili d'ambiente di Supabase! Controlla il file .env")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
/* =========================================================
   CABINET D'EXPERTISE LA DIFFÉRENCE — CONFIGURATION SUPABASE
   Ce fichier connecte le site à la base de données.
   La clé "publishable" ci-dessous est sans danger à exposer
   publiquement (elle est faite pour ça) tant que la RLS
   (Row Level Security) reste active sur les tables Supabase.
   ========================================================= */

const SUPABASE_URL = 'https://yuxrddjanfecorqztlwf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_UhnW1CShkEXRNjHjIfRBZQ__LEFuxK7';

// Client Supabase partagé, réutilisé par auth.js et dashboard.js
const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

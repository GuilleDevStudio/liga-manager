// 1️⃣ Importamos la librería
import { createClient } from '@supabase/supabase-js';

// 2️⃣ Pon aquí tu URL y tu anon key de Supabase
const supabaseUrl = 'https://hbpnjtlwxggqbmmywvuz.supabase.co';
const supabaseKey = 'sb_publishable_8X8U7Hs5-OH0AXdsiIha0g_byMHnxll';

// 3️⃣ Creamos la instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseKey);


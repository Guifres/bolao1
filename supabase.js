// supabase.js
import { createClient } from '@supabase/supabase-js';

// Substitua pelos seus dados do Supabase
const supabaseUrl = 'https://rptqhlwtghvwwksvheab.supabase.co'; // URL do seu projeto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdHFobHd0Z2h2d3drc3ZoZWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTE0MDUsImV4cCI6MjA1ODc2NzQwNX0.E8FEjh2uChJwNRVRSUYBVLr3h2KzQpcWh1FbXP9zE4U'; // Chave pública (anon)

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

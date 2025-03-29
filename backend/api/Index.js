import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

import express from 'express';
import supabase from './config/database.js';

const app = express();

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('palpites').select('*');
  
  if (error) return res.status(500).json({ error: error.message });
  
  res.json(data);
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));


export default supabase;

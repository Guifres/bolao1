// databas
import pkg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';


const {Pool} = pkg

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default supabase;


module.exports = pool;


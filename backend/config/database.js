import { Pool } from 'pg';  // Importação correta do Pool
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração da conexão com o banco de dados
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Exportar a instância de db como exportação padrão
export default db;



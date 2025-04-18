import express from 'express';
import cors from'cors';
import dotenv from 'dotenv';
import palpitesRoutes from './routes/palpites.js';
const  mercadopago = require("mercadopago")
import pagamentosRoutes from '../routes/pagamentos.js';
import db from './config/database.js';  // Conexão com PostgreSQL
import supabase from './config/database.js'; // Caminho correto do arquivo


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/palpites', palpitesRoutes);
app.use('/pagamentos', pagamentosRoutes);


// configurando as credenciais do Mercado Pago
mercadopago.configure({
    acess_token: "APP_USR-7376511829471442-032722-71e5c2bb8c14bf105afc7a0d872a6547-234082704"
});

// Rota para criar apgamneto
app.post("pagamento", async (req, res) => {
    const{ nome, telefone, valor } = req.body; //pegando os dados enviados

    const pagamento = {
        transaction_amount: parseint(valor),
        descripyion: "Pagamento do bolão",
        payment_method_id: "pix",
        payer: {
            email:"emaildopagador@email.com",
            first_name: nome,
            last_name:"",
            identification:{
                type:"CPF",
                number: telefone,

            },
        },
    }

    try {
        const pagamentoCriado = await mercadopago.payment.create(pagamento);
        res.json(pagamentoCriado.body);
      } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao processar pagamento" });
      }
    });


// 🔥 Endpoint para cadastrar resultados manualmente
app.post('/resultados', async (req, res) => {
    const { time1, time2, gols_time1, gols_time2, data } = req.body;

    try {
        await db.query(
            'INSERT INTO resultados (time1, time2, gols_time1, gols_time2, data) VALUES ($1, $2, $3, $4, $5, $6)',
            [time1, time2, gols_time1, gols_time2, data]
        );

        res.status(201).json({ message: 'Resultado cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar resultado:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Endpoint para validar palpites considerando o formato JSON do banco de dados
app.get('/palpites/vencedores', async (req, res) => {
    try {
        // Corrigindo a consulta para usar a tabela correta
        const resultadoJogos = await db.query('SELECT resultado FROM resultado'); // Corrigido o nome da tabela
        const jogos = resultadoJogos.rows.length > 0 ? resultadoJogos.rows[0].resultado : [];
        
        const resultadoPalpites = await db.query('SELECT * FROM palpites');
        const palpites = resultadoPalpites.rows;

        const vencedores = [];

        

        // Loop pelos palpites
        for (const palpite of palpites) {
            let pontos = 0;

            // Para cada palpite, comparar com o resultado real
            for (let i = 0; i < palpite.palpites.length; i++) {
                const jogoPalpite = palpite.palpites[i];

                // Encontrar o jogo correspondente
                const resultadoReal = jogos.find(jogo => {
                    const times = Object.keys(jogo);
                    const palpiteTimes = Object.keys(jogoPalpite);
                
                    return times[0].toLowerCase() === palpiteTimes[0].toLowerCase() &&
                           times[1].toLowerCase() === palpiteTimes[1].toLowerCase();
                });

                console.log(`Jogo: ${JSON.stringify(resultadoReal)}, Palpite: ${JSON.stringify(jogoPalpite)}`);

                if (!resultadoReal) continue;

                const time1 = Object.keys(jogoPalpite)[0];
                const time2 = Object.keys(jogoPalpite)[1];
                const placarPalpiteTime1 = parseInt(jogoPalpite[time1]);
                const placarPalpiteTime2 = parseInt(jogoPalpite[time2]);

                const placarRealTime1 = resultadoReal[time1];
                const placarRealTime2 = resultadoReal[time2];
                console.log(`Comparando Palpite - Time1: ${placarPalpiteTime1} vs Real: ${placarRealTime1}`);
                console.log(`Comparando Palpite - Time2: ${placarPalpiteTime2} vs Real: ${placarRealTime2}`);
                

                // Comparar placar completo
                if (placarPalpiteTime1 == placarRealTime1 && placarPalpiteTime2 == placarRealTime2) {
                    pontos += 3; // Pontuação total
                    console.log(pontos)
                } 
                else if (placarPalpiteTime1 > placarPalpiteTime2 && placarRealTime1 > placarRealTime2) {
                    pontos ++
                    console.log(pontos)
                } else if (placarPalpiteTime2 > placarPalpiteTime1 && placarRealTime2 > placarRealTime1){
                    pontos ++
                    console.log(pontos)
                }
                
                // Comparar placar parcial
            }

            // Só adiciona à lista de vencedores se o usuário fez pelo menos um palpite correto
            if (pontos >= 0) { // Alterado de >= 0 para > 0
                vencedores.push({
                    nome: palpite.nome,
                    telefone: palpite.telefone,
                    pontos,
                });
            }
    
        }

        // Retorna a lista de vencedores
        res.json({ vencedores });

    } catch (error) {
        console.error('Erro ao buscar vencedores:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});




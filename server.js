const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const palpitesRoutes = require('./routes/palpites');
const pagamentosRoutes = require('./routes/pagamentos');
const db = require('./database');  // Conexão com PostgreSQL

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/palpites', palpitesRoutes);
app.use('/pagamentos', pagamentosRoutes);

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
        const resultadoJogos = await db.query('SELECT * FROM resultado');
        const jogos = resultadoJogos.rows; // Verifique os jogos, não apenas o primeiro resultado
        
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
                    return times[0].toLowerCase() === Object.keys(jogoPalpite)[0].toLowerCase() && times[1] === Object.keys(jogoPalpite)[1];
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
                if (placarPalpiteTime1 === placarRealTime1 && placarPalpiteTime2 === placarRealTime2) {
                    pontos += 3; // Pontuação total
                } 
                // Comparar placar parcial
                else if (
                    (placarPalpiteTime1 === placarRealTime1 && placarPalpiteTime2 !== placarRealTime2) ||
                    (placarPalpiteTime1 !== placarRealTime1 && placarPalpiteTime2 === placarRealTime2)
                ) {
                    pontos += 1; // Pontuação parcial
                }
            }

            // Só adiciona à lista de vencedores se o usuário fez pelo menos um palpite correto
            if (pontos > 0) {
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




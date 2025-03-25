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
            'INSERT INTO resultados (time1, time2, gols_time1, gols_time2, data) VALUES ($1, $2, $3, $4, $5)',
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
        // Recuperar os resultados dos jogos
        const resultadoJogos = await db.query('SELECT * FROM resultados_rodada');
        const jogos = resultadoJogos.rows[0].resultados; // Converte os jogos em um array de objetos

        // Recuperar os palpites dos usuários
        const resultadoPalpites = await db.query('SELECT * FROM palpites');
        const palpites = resultadoPalpites.rows;

        // Armazenar os vencedores
        const vencedores = [];

        // Loop através dos palpites e comparar com os resultados
        for (const palpite of palpites) {
            let pontos = 0;

            // Iterando sobre os palpites do usuário
            for (let i = 0; i < palpite.palpites.length; i++) {
                const jogoPalpite = palpite.palpites[i];

                // Encontrar o jogo correspondente ao palpite
                const resultadoReal = jogos.find(jogo => {
                    const times = Object.keys(jogo);
                    return times[0] === Object.keys(jogoPalpite)[0] && times[1] === Object.keys(jogoPalpite)[1];
                });

                // Se não encontrar o jogo real, ignora esse palpite
                if (!resultadoReal) continue;

                const time1 = Object.keys(jogoPalpite)[0];
                const time2 = Object.keys(jogoPalpite)[1];
                const placarPalpiteTime1 = parseInt(jogoPalpite[time1]);
                const placarPalpiteTime2 = parseInt(jogoPalpite[time2]);

                // Verificar o placar
                const placarRealTime1 = resultadoReal[time1];
                const placarRealTime2 = resultadoReal[time2];

                // Comparar o placar dos dois times
                if (placarPalpiteTime1 === parseInt(placarRealTime1) && placarPalpiteTime2 === parseInt(placarRealTime2)) {
                    pontos += 3; // Pontuação completa para acerto total
                } else if (
                    (placarPalpiteTime1 === parseInt(placarRealTime1) && placarPalpiteTime2 !== parseInt(placarRealTime2)) ||
                    (placarPalpiteTime1 !== parseInt(placarRealTime1) && placarPalpiteTime2 === parseInt(placarRealTime2))
                ) {
                    pontos += 1; // Pontuação parcial para acerto de um dos times
                }
            }

            // Se o usuário acertou algum palpite, adicione ele aos vencedores
            if (pontos > 0) {
                vencedores.push({ nome: palpite.nome, telefone: palpite.telefone, pontos });
            }
        }

        // Retorne os vencedores como resposta
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




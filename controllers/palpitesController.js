const db = require('../database');

const registrarPalpite = (req, res) => {
    const { nome, telefone, palpites } = req.body;

    if (!nome || !telefone || !palpites) {
        return res.status(400).json({ mensagem: 'Dados incompletos.' });
    }

    const query = `INSERT INTO palpites (nome, telefone, palpites) VALUES ($1, $2, $3) RETURNING *`;
    const values = [nome, telefone, JSON.stringify(palpites)];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao registrar palpite:', err);
            return res.status(500).json({ mensagem: 'Erro ao registrar palpite.' });
        }

        res.json({ mensagem: 'Palpite registrado com sucesso!', palpite: result.rows[0] });
    });
};

const listarPalpites = (req, res) => {
    const query = `SELECT * FROM palpites`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Erro ao buscar palpites:', err);
            return res.status(500).json({ mensagem: 'Erro ao buscar palpites.' });
        }

        res.json(result.rows.map(row => ({
            id: row.id,
            nome: row.nome,
            telefone: row.telefone,
            palpites: JSON.parse(row.palpites),
            data: row.data
        })));
    });
};

const validarPalpites = async (req, res) => {
    try {
        // Buscar resultados da última rodada
        const resultadoJogos = await db.query('SELECT resultados FROM resultados_rodada ORDER BY data DESC LIMIT 1');

        // Certifique-se de que 'resultadoJogos.rows[0].resultados' é um objeto
        const jogos = resultadoJogos.rows[0].resultados;

        // Se 'resultados' for uma string JSON, use JSON.parse() para convertê-lo
        // Caso contrário, se já for um objeto, não faça nada
        const jogosParsed = typeof jogos === 'string' ? JSON.parse(jogos) : jogos;

        // Buscar todos os palpites registrados
        const palpitesRegistrados = await db.query('SELECT * FROM palpites');

        let vencedores = [];

        palpitesRegistrados.rows.forEach(palpite => {
            const palpitesUsuario = JSON.parse(palpite.palpites);
            let pontos = 0;

            // Comparar cada jogo com o palpite do usuário
            jogosParsed.forEach(jogo => {
                const [time1, time2] = Object.keys(jogo);
                const resultadoTime1 = parseInt(jogo[time1]);
                const resultadoTime2 = parseInt(jogo[time2]);

                // Verificando se o usuário acertou o placar exato
                if (palpitesUsuario[time1] === resultadoTime1 && palpitesUsuario[time2] === resultadoTime2) {
                    pontos += 3;  // 3 pontos para o placar exato
                }
                // Verificando se o usuário acertou apenas o vencedor
                else if (
                    (resultadoTime1 > resultadoTime2 && palpitesUsuario[time1] > palpitesUsuario[time2]) ||
                    (resultadoTime2 > resultadoTime1 && palpitesUsuario[time2] > palpitesUsuario[time1])
                ) {
                    pontos += 1;  // 1 ponto para acertar o vencedor
                }
            });

            // Armazenar o nome, telefone e os pontos do usuário
            vencedores.push({ nome: palpite.nome, telefone: palpite.telefone, pontos });
        });

        // Ordenar os vencedores por pontos, do maior para o menor
        vencedores.sort((a, b) => b.pontos - a.pontos);

        // Retornar a lista dos vencedores
        res.status(200).json({ vencedores });
    } catch (error) {
        console.error('Erro ao validar palpites:', error);
        res.status(500).json({ mensagem: 'Erro ao validar palpites.' });
    }
};




module.exports = { registrarPalpite, listarPalpites, validarPalpites };

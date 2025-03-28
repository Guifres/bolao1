import supabase from './supabase';

// Registrar palpite
const registrarPalpite = (req, res) => {
    const { nome, telefone, palpites } = req.body;

    if (!nome || !telefone || !palpites) {
        return res.status(400).json({ mensagem: 'Dados incompletos.' });
    }

    // Inserir todos os palpites em um único campo JSON
    const query = `INSERT INTO palpites (nome, telefone, palpites) 
                   VALUES ($1, $2, $3) RETURNING *`;
    
    const values = [nome, telefone, JSON.stringify(palpites)];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao registrar palpite:', err);
            return res.status(500).json({ mensagem: 'Erro ao registrar palpite.' });
        }

        res.json({ mensagem: 'Palpite registrado com sucesso!', palpite: result.rows[0] });
    });
};

// Listar todos os palpites
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
            palpites: row.palpites, // Agora é um JSON
            data: row.data
        })));
    });
};

// Validar palpites
const validarPalpites = async (req, res) => {
    try {
        // Buscar todos os resultados da rodada
        const resultadosRodada = await db.query('SELECT * FROM resultado'); // Aqui deve ser a tabela de resultados, onde a estrutura será { time1, gols_time1, time2, gols_time2 }

        // Buscar todos os palpites registrados
        const palpitesRegistrados = await db.query('SELECT * FROM palpites');

        let vencedores = [];

        palpitesRegistrados.rows.forEach(palpite => {
            let pontos = 0;

            // Extrair os palpites (JSON) para o usuário
            const palpitesUsuario = palpite.palpites;

            // Comparar cada jogo com o palpite do usuário
            resultadosRodada.rows.forEach(jogo => {
                const resultadoTime1 = jogo.gols_time1;
                const resultadoTime2 = jogo.gols_time2;
                const time1 = jogo.time1;
                const time2 = jogo.time2;

                console.log(time1)
                console.log(time2)

                // Extrair os palpites do usuário para o jogo atual
                const palpiteTime1 = palpitesUsuario.find(p => p[time1] !== undefined)[time1];
                const palpiteTime2 = palpitesUsuario.find(p => p[time2] !== undefined)[time2];

                if (isNaN(palpiteTime1) || isNaN(palpiteTime2)) {
                    return; // Ignora palpites inválidos
                }

                // Verificando se o usuário acertou o placar exato
                if (parseInt(palpiteTime1) === resultadoTime1 && parseInt(palpiteTime2) === resultadoTime2) {
                    pontos += 3; // Placar exato = 3 pontos
                } else if (
                    (resultadoTime1 > resultadoTime2 && parseInt(palpiteTime1) > parseInt(palpiteTime2)) ||  // Acertou vencedor do time1
                    (resultadoTime2 > resultadoTime1 && parseInt(palpiteTime2) > parseInt(palpiteTime1)) ||  // Acertou vencedor do time2
                    (resultadoTime1 === resultadoTime2 && parseInt(palpiteTime1) === parseInt(palpiteTime2))  // Acertou empate sem placar exato
                ) {
                    pontos += 1; // Acertou vencedor ou empate = 1 ponto
                }
            });

            // Armazenar o nome, telefone e os pontos do usuário
            vencedores.push({ nome: palpite.nome, telefone: palpite.telefone, pontos });
        });

        // Ordenar os vencedores por pontos, do maior para o menor
        vencedores.sort((a, b) => b.pontos - a.pontos);

        res.status(200).json({ vencedores });
    } catch (error) {
        console.error('Erro ao validar palpites:', error);
        res.status(500).json({ mensagem: 'Erro ao validar palpites.' });
    }
};

module.exports = { registrarPalpite, listarPalpites, validarPalpites };

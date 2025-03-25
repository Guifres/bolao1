const axios = require('axios');

const criarPagamento = async (req, res) => {
    const { nome, telefone, valor } = req.body;

    if (!nome || !telefone || !valor) {
        return res.status(400).json({ mensagem: 'Dados incompletos.' });
    }

    try {
        const response = await axios.post(
            `${process.env.ASAAS_API_URL}/payments`,
            {
                customer: nome,
                value: valor,
                dueDate: new Date().toISOString().split('T')[0],
                billingType: 'PIX'
            },
            {
                headers: {
                    access_token: process.env.ASAAS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ mensagem: 'Pagamento criado com sucesso!', pagamento: response.data });
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao criar pagamento.', erro: error.message });
    }
};

module.exports = { criarPagamento };

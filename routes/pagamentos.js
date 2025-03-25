const express = require('express');
const router = express.Router();
const { criarPagamento } = require('../controllers/pagamentosController');

router.post('/criar', criarPagamento);

module.exports = router;

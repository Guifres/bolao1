const express = require('express');
const router = express.Router();
const { registrarPalpite, listarPalpites, validarPalpites } = require('../controllers/palpitesController');

router.post('/registrar', registrarPalpite);
router.get('/listar', listarPalpites);
router.get('/validar', validarPalpites)

module.exports = router;

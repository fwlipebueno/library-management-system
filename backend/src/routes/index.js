const { Router } = require('express');
const auth = require('../controllers/authController');
const livros = require('../controllers/livroController');
const usuarios = require('../controllers/usuarioController');
const emprestimos = require('../controllers/emprestimoController');
const { autenticar, somenteAdmin } = require('../middlewares/autenticacao');

const router = Router();

router.post('/auth/login', auth.login);
router.use(autenticar);
router.get('/livros', livros.listar);
router.get('/livros/:id', livros.buscar);
router.post('/livros', somenteAdmin, livros.cadastrar);
router.put('/livros/:id', somenteAdmin, livros.editar);
router.delete('/livros/:id', somenteAdmin, livros.excluir);
router.get('/usuarios', somenteAdmin, usuarios.listar);
router.post('/usuarios', somenteAdmin, usuarios.cadastrar);
router.put('/usuarios/:id', somenteAdmin, usuarios.editar);
router.get('/emprestimos/meus', emprestimos.meus);
router.get('/emprestimos', somenteAdmin, emprestimos.listar);
router.post('/emprestimos', somenteAdmin, emprestimos.cadastrar);
router.patch('/emprestimos/:id/devolucao', somenteAdmin, emprestimos.devolver);

module.exports = router;

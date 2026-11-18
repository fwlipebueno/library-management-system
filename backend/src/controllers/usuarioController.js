const usuarioService = require('../services/usuarioService');

exports.listar = async (req, res) => res.status(200).json(await usuarioService.listar());
exports.cadastrar = async (req, res) => res.status(201).json(await usuarioService.cadastrar(req.body));
exports.editar = async (req, res) => res.status(200).json(await usuarioService.editar(req.params.id, req.body));

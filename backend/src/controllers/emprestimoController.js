const emprestimoService = require('../services/emprestimoService');

exports.listar = async (req, res) => res.status(200).json(await emprestimoService.listar());
exports.meus = async (req, res) => res.status(200).json(await emprestimoService.listar(req.usuario.id));
exports.cadastrar = async (req, res) => res.status(201).json(await emprestimoService.cadastrar(req.body));
exports.devolver = async (req, res) => res.status(200).json(await emprestimoService.devolver(req.params.id));

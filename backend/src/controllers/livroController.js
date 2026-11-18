const livroService = require('../services/livroService');

exports.listar = async (req, res) => res.status(200).json(await livroService.listar(req.query));
exports.buscar = async (req, res) => res.status(200).json(await livroService.buscar(req.params.id));
exports.cadastrar = async (req, res) => res.status(201).json(await livroService.cadastrar(req.body));
exports.editar = async (req, res) => res.status(200).json(await livroService.editar(req.params.id, req.body));
exports.excluir = async (req, res) => {
  await livroService.excluir(req.params.id);
  res.status(204).send();
};

const { Op } = require('sequelize');
const { sequelize, Livro, Emprestimo } = require('../models');
const ErroHttp = require('./ErroHttp');
const validar = require('./validacao');

function dadosLivro(dados) {
  validar.corpo(dados);
  if (Object.hasOwn(dados, 'quantidadeDisponivel')) {
    validar.invalido('A quantidade disponível é calculada pelo servidor.');
  }
  return {
    titulo: validar.texto(dados.titulo, 'Título'),
    autor: validar.texto(dados.autor, 'Autor'),
    isbn: validar.texto(dados.isbn, 'ISBN', 64),
    ano: validar.inteiro(dados.ano, 'Ano', 1, 9999),
    quantidadeTotal: validar.inteiro(dados.quantidadeTotal, 'Quantidade total')
  };
}

async function listar(filtros) {
  const where = { ativo: true };
  for (const campo of ['titulo', 'autor']) {
    if (filtros[campo] !== undefined) {
      if (typeof filtros[campo] !== 'string') validar.invalido('Título e autor devem ser textos.');
      const termo = filtros[campo].trim();
      if (termo.length > 255) validar.invalido('A pesquisa deve ter até 255 caracteres por campo.');
      if (termo) {
        const escapado = termo.replace(/[\\%_]/g, '\\$&');
        where[campo] = { [Op.iLike]: `%${escapado}%` };
      }
    }
  }
  return Livro.findAll({ where, order: [['titulo', 'ASC'], ['id', 'ASC']] });
}

async function buscar(id, opcoes = {}) {
  const livro = await Livro.findOne({ where: { id: validar.id(id), ativo: true }, ...opcoes });
  if (!livro) throw new ErroHttp(404, 'Livro não encontrado.', 'LIVRO_NAO_ENCONTRADO');
  return livro;
}

async function cadastrar(dados) {
  const valores = dadosLivro(dados);
  return Livro.create({ ...valores, quantidadeDisponivel: valores.quantidadeTotal });
}

async function editar(id, dados) {
  const valores = dadosLivro(dados);
  return sequelize.transaction(async transaction => {
    const livro = await buscar(id, { transaction, lock: transaction.LOCK.UPDATE });
    const emprestados = livro.quantidadeTotal - livro.quantidadeDisponivel;
    if (valores.quantidadeTotal < emprestados) {
      throw new ErroHttp(409, `Há ${emprestados} exemplar(es) emprestado(s). A quantidade total não pode ser menor.`, 'QUANTIDADE_EMPRESTADA');
    }
    return livro.update({
      ...valores, quantidadeDisponivel: valores.quantidadeTotal - emprestados
    }, { transaction });
  });
}

async function excluir(id) {
  return sequelize.transaction(async transaction => {
    const livro = await buscar(id, { transaction, lock: transaction.LOCK.UPDATE });
    const ativos = await Emprestimo.count({ where: { livroId: livro.id, status: 'ativo' }, transaction });
    if (ativos > 0) {
      throw new ErroHttp(409, 'Este livro possui empréstimo ativo e não pode ser excluído.', 'LIVRO_EMPRESTADO');
    }
    await livro.update({ ativo: false }, { transaction });
  });
}

module.exports = { listar, buscar, cadastrar, editar, excluir };

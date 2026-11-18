const { sequelize, Usuario, Livro, Emprestimo } = require('../models');
const ErroHttp = require('./ErroHttp');
const validar = require('./validacao');

const include = [
  { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
  { model: Livro, as: 'livro' }
];

function listar(usuarioId) {
  return Emprestimo.findAll({
    where: usuarioId === undefined ? {} : { usuarioId },
    include,
    order: [['dataEmprestimo', 'DESC'], ['id', 'DESC']]
  });
}

async function cadastrar(dados) {
  validar.corpo(dados);
  const usuarioId = validar.id(dados.usuarioId);
  const livroId = validar.id(dados.livroId);
  const dataPrevista = validar.data(dados.dataPrevista);
  return sequelize.transaction(async transaction => {
    const usuario = await Usuario.findByPk(usuarioId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!usuario) throw new ErroHttp(404, 'Usuário não encontrado.', 'USUARIO_NAO_ENCONTRADO');
    if (!usuario.ativo) throw new ErroHttp(409, 'Usuário desativado não pode receber empréstimos.', 'USUARIO_INATIVO');
    const livro = await Livro.findByPk(livroId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!livro || !livro.ativo) throw new ErroHttp(404, 'Livro não encontrado.', 'LIVRO_NAO_ENCONTRADO');
    if (livro.quantidadeDisponivel === 0) {
      throw new ErroHttp(409, 'Livro sem exemplares disponíveis para empréstimo.', 'LIVRO_INDISPONIVEL');
    }
    const emprestimo = await Emprestimo.create({
      usuarioId, livroId, dataPrevista, dataEmprestimo: new Date(), status: 'ativo'
    }, { transaction });
    await livro.update({ quantidadeDisponivel: livro.quantidadeDisponivel - 1 }, { transaction });
    return Emprestimo.findByPk(emprestimo.id, { include, transaction });
  });
}

async function devolver(id) {
  const emprestimoId = validar.id(id);
  return sequelize.transaction(async transaction => {
    const emprestimo = await Emprestimo.findByPk(emprestimoId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!emprestimo) throw new ErroHttp(404, 'Empréstimo não encontrado.', 'EMPRESTIMO_NAO_ENCONTRADO');
    if (emprestimo.status !== 'ativo') {
      throw new ErroHttp(409, 'A devolução deste empréstimo já foi registrada.', 'EMPRESTIMO_DEVOLVIDO');
    }
    const livro = await Livro.findByPk(emprestimo.livroId, { transaction, lock: transaction.LOCK.UPDATE });
    if (livro.quantidadeDisponivel >= livro.quantidadeTotal) {
      throw new ErroHttp(409, 'A devolução ultrapassaria a quantidade total do livro.', 'QUANTIDADE_INCONSISTENTE');
    }
    await emprestimo.update({ dataDevolucao: new Date(), status: 'devolvido' }, { transaction });
    await livro.update({ quantidadeDisponivel: livro.quantidadeDisponivel + 1 }, { transaction });
    return Emprestimo.findByPk(emprestimo.id, { include, transaction });
  });
}

module.exports = { listar, cadastrar, devolver };

const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../models');
const ErroHttp = require('./ErroHttp');
const validar = require('./validacao');

async function dadosUsuario(dados, cadastro) {
  validar.corpo(dados);
  if (!['admin', 'usuario'].includes(dados.perfil)) validar.invalido('O perfil deve ser admin ou usuario.');
  if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') validar.invalido('Ativo deve ser verdadeiro ou falso.');
  if (!cadastro && typeof dados.ativo !== 'boolean') validar.invalido('Informe se a conta está ativa.');
  const valores = {
    nome: validar.texto(dados.nome, 'Nome', 150),
    email: validar.email(dados.email),
    perfil: dados.perfil,
    ativo: cadastro ? (dados.ativo ?? true) : dados.ativo
  };
  if (cadastro || dados.senha !== undefined) {
    valores.senhaHash = await bcrypt.hash(validar.senha(dados.senha), 12);
  }
  return valores;
}

function listar() {
  return Usuario.findAll({ order: [['nome', 'ASC'], ['id', 'ASC']] });
}

async function cadastrar(dados) {
  return Usuario.create(await dadosUsuario(dados, true));
}

async function editar(id, dados) {
  const usuarioId = validar.id(id);
  const valores = await dadosUsuario(dados, false);
  return sequelize.transaction(async transaction => {
    const usuario = await Usuario.findByPk(usuarioId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!usuario) throw new ErroHttp(404, 'Usuário não encontrado.', 'USUARIO_NAO_ENCONTRADO');
    await usuario.update(valores, { transaction });
    return usuario;
  });
}

module.exports = { listar, cadastrar, editar };

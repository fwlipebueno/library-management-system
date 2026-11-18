const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { Usuario } = require('../models');
const ErroHttp = require('../services/ErroHttp');

async function autenticar(req, res, next) {
  const partes = /^Bearer (\S+)$/i.exec(req.headers.authorization || '');
  if (!partes) throw new ErroHttp(401, 'Entre na sua conta para continuar.', 'TOKEN_AUSENTE');
  let dados;
  try {
    dados = jwt.verify(partes[1], jwtSecret, { algorithms: ['HS256'] });
    if (!/^[1-9]\d*$/.test(dados.sub) || !Number.isInteger(dados.exp) || Number(dados.sub) > 2147483647) {
      throw new Error('Claims inválidas.');
    }
  } catch (erro) {
    const expirado = erro.name === 'TokenExpiredError';
    throw new ErroHttp(401,
      expirado ? 'Sua sessão expirou. Entre novamente.' : 'Sessão inválida. Entre novamente.',
      expirado ? 'SESSAO_EXPIRADA' : 'TOKEN_INVALIDO');
  }
  const usuario = await Usuario.findByPk(Number(dados.sub));
  if (!usuario || !usuario.ativo) {
    throw new ErroHttp(401, 'Sessão inválida ou conta desativada. Entre novamente.', 'USUARIO_INATIVO');
  }
  req.usuario = usuario;
  next();
}

function somenteAdmin(req, res, next) {
  if (req.usuario.perfil !== 'admin') {
    throw new ErroHttp(403, 'Acesso permitido somente a administradores.', 'ACESSO_NEGADO');
  }
  next();
}

module.exports = { autenticar, somenteAdmin };

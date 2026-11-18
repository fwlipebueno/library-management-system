const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { jwtSecret } = require('../config/env');
const ErroHttp = require('./ErroHttp');
const validar = require('./validacao');

if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.startsWith('ALTERE')) {
  throw new Error('Configure JWT_SECRET com um segredo aleatório de pelo menos 32 caracteres.');
}

async function login(dados) {
  validar.corpo(dados);
  const email = validar.email(dados.email);
  const senha = validar.senha(dados.senha);
  const usuario = await Usuario.scope('comSenha').findOne({ where: { email } });
  if (!usuario || !usuario.ativo || !(await bcrypt.compare(senha, usuario.senhaHash))) {
    throw new ErroHttp(401, 'Email ou senha inválidos, ou conta desativada.', 'CREDENCIAIS_INVALIDAS');
  }
  const token = jwt.sign({}, jwtSecret, {
    algorithm: 'HS256', subject: String(usuario.id), expiresIn: '1h'
  });
  return { token, usuario: usuario.toJSON() };
}

module.exports = { login };

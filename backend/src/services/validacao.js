const ErroHttp = require('./ErroHttp');

function invalido(mensagem) {
  throw new ErroHttp(400, mensagem, 'DADOS_INVALIDOS');
}

function corpo(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    invalido('Envie um objeto JSON com os dados da operação.');
  }
}

function texto(valor, campo, maximo = 255) {
  if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > maximo) {
    invalido(`${campo} é obrigatório e deve ter até ${maximo} caracteres.`);
  }
  return valor.trim();
}

function inteiro(valor, campo, minimo = 0, maximo = 2147483647) {
  if (!Number.isInteger(valor) || valor < minimo || valor > maximo) {
    invalido(`${campo} deve ser um número inteiro entre ${minimo} e ${maximo}.`);
  }
  return valor;
}

function id(valor) {
  if (typeof valor === 'string' && /^[1-9]\d*$/.test(valor)) valor = Number(valor);
  return inteiro(valor, 'Identificador', 1);
}

function email(valor) {
  const endereco = texto(valor, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(endereco)) invalido('Informe um email válido.');
  return endereco;
}

function senha(valor) {
  if (typeof valor !== 'string' || !valor.trim() || Buffer.byteLength(valor, 'utf8') > 72) {
    invalido('Informe uma senha não vazia com até 72 bytes em UTF-8.');
  }
  return valor;
}

function data(valor) {
  if (typeof valor !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(valor) || valor.startsWith('0000')) {
    invalido('Informe uma data prevista válida no formato AAAA-MM-DD.');
  }
  const convertida = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(convertida.getTime()) || convertida.toISOString().slice(0, 10) !== valor) {
    invalido('Informe uma data prevista válida.');
  }
  return valor;
}

module.exports = { invalido, corpo, texto, inteiro, id, email, senha, data };

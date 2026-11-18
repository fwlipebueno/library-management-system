const ErroHttp = require('../services/ErroHttp');

module.exports = (erro, req, res, next) => {
  if (res.headersSent) return next(erro);
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message, codigo: erro.codigo });
  }
  if (erro.type === 'entity.parse.failed' || erro.type === 'entity.too.large') {
    return res.status(400).json({ erro: 'Envie um JSON válido de até 100 KB.', codigo: 'JSON_INVALIDO' });
  }
  if (erro.name === 'SequelizeUniqueConstraintError') {
    const campo = erro.errors?.[0]?.path;
    const mensagem = campo === 'isbn' ? 'ISBN já cadastrado.' : 'Email já cadastrado.';
    return res.status(409).json({ erro: mensagem, codigo: 'REGISTRO_DUPLICADO' });
  }
  if (erro.name === 'SequelizeValidationError') {
    return res.status(400).json({ erro: 'Verifique os dados e os limites dos campos.', codigo: 'DADOS_INVALIDOS' });
  }
  if (erro.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ erro: 'O registro possui vínculos que impedem esta operação.', codigo: 'REGISTRO_VINCULADO' });
  }
  console.error('Falha interna ao processar a requisição:', erro.name);
  return res.status(500).json({ erro: 'Não foi possível concluir a operação. Tente novamente.', codigo: 'ERRO_INTERNO' });
};

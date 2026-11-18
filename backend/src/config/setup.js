const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Livro } = require('../models');

async function setup() {
  await sequelize.sync();
  await sequelize.transaction(async transaction => {
    for (const conta of [
      { nome: 'Administrador', email: 'admin@biblioteca.test', senha: 'Admin123!', perfil: 'admin' },
      { nome: 'Ana Souza', email: 'usuario@biblioteca.test', senha: 'Usuario123!', perfil: 'usuario' }
    ]) {
      await Usuario.findOrCreate({
        where: { email: conta.email },
        defaults: {
          nome: conta.nome, email: conta.email, perfil: conta.perfil,
          senhaHash: await bcrypt.hash(conta.senha, 12), ativo: true
        },
        transaction
      });
    }
    for (const livro of [
      { titulo: 'Dom Casmurro', autor: 'Machado de Assis', isbn: '9788535914849', ano: 1899, quantidadeTotal: 1 },
      { titulo: 'O Cortiço', autor: 'Aluísio Azevedo', isbn: '9788525406958', ano: 1890, quantidadeTotal: 2 },
      { titulo: 'Capitães da Areia', autor: 'Jorge Amado', isbn: '9788535914061', ano: 1937, quantidadeTotal: 1 },
      { titulo: 'Entendendo Algoritmos', autor: 'Aditya Bhargava', isbn: '9788575225639', ano: 2017, quantidadeTotal: 0 }
    ]) {
      await Livro.findOrCreate({
        where: { isbn: livro.isbn },
        defaults: { ...livro, quantidadeDisponivel: livro.quantidadeTotal, ativo: true },
        transaction
      });
    }
  });
  console.log('Banco preparado. Dados iniciais existentes foram preservados.');
}

setup().catch(() => {
  console.error('Falha no setup. Confira o banco, as credenciais e as permissões de criação de tabelas.');
  process.exitCode = 1;
}).finally(() => sequelize.close());

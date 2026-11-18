const sequelize = require('../config/db');
const Usuario = require('./Usuario');
const Livro = require('./Livro');
const Emprestimo = require('./Emprestimo');

Usuario.hasMany(Emprestimo, { foreignKey: 'usuarioId', as: 'emprestimos', onDelete: 'RESTRICT' });
Emprestimo.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario', onDelete: 'RESTRICT' });
Livro.hasMany(Emprestimo, { foreignKey: 'livroId', as: 'emprestimos', onDelete: 'RESTRICT' });
Emprestimo.belongsTo(Livro, { foreignKey: 'livroId', as: 'livro', onDelete: 'RESTRICT' });

module.exports = { sequelize, Usuario, Livro, Emprestimo };

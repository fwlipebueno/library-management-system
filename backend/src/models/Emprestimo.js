const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Emprestimo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false },
  livroId: { type: DataTypes.INTEGER, allowNull: false },
  dataEmprestimo: { type: DataTypes.DATE, allowNull: false },
  dataPrevista: { type: DataTypes.DATEONLY, allowNull: false },
  dataDevolucao: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  status: { type: DataTypes.ENUM('ativo', 'devolvido'), allowNull: false, defaultValue: 'ativo' }
}, { tableName: 'emprestimos' });

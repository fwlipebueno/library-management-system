const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Livro', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
  autor: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
  isbn: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  ano: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 9999 } },
  quantidadeTotal: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  quantidadeDisponivel: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'livros',
  validate: {
    disponibilidadeValida() {
      if (this.quantidadeDisponivel > this.quantidadeTotal) {
        throw new Error('Disponibilidade superior à quantidade total.');
      }
    }
  }
});

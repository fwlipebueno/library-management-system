const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(150), allowNull: false, validate: { notEmpty: true } },
  email: {
    type: DataTypes.STRING(254), allowNull: false, unique: true,
    validate: { isEmail: true }
  },
  senhaHash: { type: DataTypes.STRING, allowNull: false },
  perfil: { type: DataTypes.ENUM('admin', 'usuario'), allowNull: false },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'usuarios',
  defaultScope: { attributes: { exclude: ['senhaHash'] } },
  scopes: {
    comSenha: { attributes: ['id', 'nome', 'email', 'senhaHash', 'perfil', 'ativo'] }
  }
});

Usuario.prototype.toJSON = function () {
  const dados = { ...this.get() };
  delete dados.senhaHash;
  return dados;
};

module.exports = Usuario;

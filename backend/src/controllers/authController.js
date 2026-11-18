const authService = require('../services/authService');

exports.login = async (req, res) => {
  res.status(200).json(await authService.login(req.body));
};

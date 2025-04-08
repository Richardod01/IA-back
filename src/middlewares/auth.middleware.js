const jwt = require('jsonwebtoken');
const { request, response } = require('express');
const client = require('../database/connect.js');
const isAuthenticated = async (req = request, res = response, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) return res.status(404).json({ message: 'No se ha encontrado el token' });
    const verify = await jwt.verify(token, process.env.SECRET_KEY);
    const usuario = await client.execute({
      sql: `SELECT id, rol FROM users WHERE id = ?`, 
      args: [verify.id],
    });
    const result = usuario.rows;
    if (result.length) {
      req.user = result[0];
      return next();
    }
  } catch (error) {
    res.status(401).json({ message: 'Acceso denegado' })
    return next(error);
  }
}
module.exports = isAuthenticated;
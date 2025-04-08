const { request, response } = require('express');
const client = require('../database/connect.js');
const {generateCode} = require('../utils/generateCode.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { parseInsertArray } = require('../utils/sqlParse.js');

async function createUser(req = request, res = response) {
    try {
      let { name, lastname, mail, password, rol, age, state } = req.body;



      if (!name || !lastname || !password)
        return res.status(400).json({
          info: {
            ok: false,
            status: 400,
            message: "Nombre, apellidos, y password son requeridos",
          },
        });


      const user = await client.execute({
        sql: `SELECT id FROM users WHERE mail = ?`,
        args: [mail.trim()],
      });
      const resultUser = user.rows;
      if (resultUser.length)
        return res.status(400).json({
          info: {
            ok: false,
            status: 400,
            message: "El correo ya existe",
          },
        });


      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);


      const array = parseInsertArray("users", {
        id: generateCode(),
        name: name.trim(),
        lastname: lastname.trim(),
        rol: rol || "paciente",
        ...req.body,
      })
      await client.batch(array, "write");


      const token = await jwt.sign(
        {
          id: generateCode(),
        },
        process.env.SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      return res
        .status(200)
        .cookie("token", token)
        .json({
          info: {
            ok: true,
            status: 200,
            message: "Usuario Creado Correctamente",
          },
        });
    } catch (error) {
      return res.status(500).json({
        info: {
          ok: false,
          status: 500,
          message: "Error al Crear el Usuario",
          error,
        },
      });
    }
  }


async function login(req = request, res = response) {
  try {
    const { mail, password } = req.body;

    // Verificamos que ingresen datos
    if (!mail || !password)
      return res.status(404).json({
        info: {
          ok: false,
          status: 404,
          message: "mail y password son requeridos",
        },
      });

    // Verificamos si el usuario existe
    const user = await client.execute({
      sql: `SELECT id, password, name, mail, lastname, rol FROM users WHERE mail = ?`,
      args: [mail.trim()],
    });
    const resultUser = user.rows;
    if (!resultUser.length)
      return res.status(404).json({
        info: {
          ok: false,
          status: 404,
          message: "El usuario no existe",
        },
        errors: { mail: true, password: false },
      });

    // Comprobamos contraseñas
    const searchPass = await bcrypt.compare(password, resultUser[0].password);
    if (!searchPass)
      return res.status(400).json({
        info: {
          ok: false,
          status: 400,
          message: "Contraseña Incorrecta",
        },
        errors: { mail: false, password: true },
      });

    // Creamos el token
    const token = await jwt.sign(
      {
        id: resultUser[0].id,
      },
      process.env.SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Enviamos el token
    return res
      .status(200)
      .cookie("token", token)
      .json({
        info: {
          ok: true,
          status: 200,
          message: "Ingresado Correctamente",
        },
        data: {
          token,
          id: resultUser[0].id,
          name: resultUser[0].name,
          lastname: resultUser[0].lastname,
          mail: mail,
          rol: resultUser[0].rol,
        },
      });
  } catch (error) {
    return res.status(500).json({
      info: {
        ok: false,
        status: 500,
        message: "Error al Ingresar",
        error,
      },
      errors: { mail: false, password: false, error: true },
    });
  }
}

async function isLogin(req = request, res = response) {
  const token = req.headers["authorization"];

  try {
    const verify = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await client.execute({
      sql: `SELECT id, name, mail, lastname, rol, gender, state FROM users WHERE id = ?`,
      args: [verify.id],
    });
    const resultUser = user.rows;
    return res.status(200).json({
      info: {
        ok: true,
        status: 200,
        message: "Usuario autenticado",
      },
      data: {
        id: resultUser[0].id,
        name: resultUser[0].name,
        lastname: resultUser[0].lastname,
        username: resultUser[0].username,
        rol: resultUser[0].rol,
      },
    });
  } catch (error) {
    return res.status(500).json({
      info: {
        ok: false,
        status: 500,
        message: "Error al ingresar",
        error,
      },
    });
  }
}

module.exports = {
    createUser,
    login,
    isLogin
}
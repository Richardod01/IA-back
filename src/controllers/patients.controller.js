const { request, response } = require('express');
const client = require('../database/connect.js');
const {generateCode} = require('../utils/generateCode.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { parseInsertArray, parseUpdateArray } = require('../utils/sqlParse.js');
async function createPatient(req = request, res = response) {
    try {
      // name, lastname, email, password, id_doctor, age, gender, medical_history, status, total_sessions = req.body;
      if (req.body.name === undefined || req.body.lastname === undefined || req.body.email === undefined || req.body.password === undefined || req.body.id_doctor === undefined || req.body.age === undefined || req.body.gender === undefined){
        return res.status(400).json({
            message: "Nombre, apellidos, email, password, id_doctor, edad y genero son requeridos",
        });
      }
      const patient = await client.execute({
        sql: `SELECT id FROM patients WHERE email = ?`,
        args: [req.body.email],
      });
      const resultPatient = patient.rows;
      if (resultPatient.length){
        return res.status(200).json({
            message: "El correo ya existe",
        });
      }
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
      const array = parseInsertArray("patients", {
        id: generateCode(),
        name: req.body.name,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        id_doctor: req.body.id_doctor || null,
        age: req.body.age,
        gender: req.body.gender,
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
        .status(201)
        .cookie("token", token)
        .json({
          info: {
            message: "Paciente Creado Correctamente",
            token
          },
        });
    } catch (error) {
      console.log(error);
      
      return res.status(500).json({
        info: {
          message: "Error al Crear el Paciente",
          error,
        },
      });
    }
  }

async function getPatients(req = request, res = response) {
    try {
      const query = await client.execute(`SELECT id, name, lastname, id_doctor, email, age, gender, medical_history, status, total_sessions, date_register FROM patients`);
        const users = query.rows;
        if (users.length === 0) {
            return res.status(200).json({
                message: 'No hay pacientes registrados'
            });
        }
        return res.status(200).json({
            message: 'Pacientes obtenidos exitosamente',
            users
        });
    } catch (error) {
      return res.status(500).json({
        message:"Error al obtener los pacientes",
        error,
      })
    }  
}
async function getPatientsbyDoctor(req = request, res = response) {
  const {id_doctor} = req.params;
  try {
    const query1 = await client.execute({
      sql: `SELECT id FROM psychologists WHERE id = ?`,
      args: [id_doctor],
    });
    const doctor = query1.rows;
    if(doctor.length === 0){
      return res.status(200).json({
        message: 'El doctor no existe o es incorrecto',
        doctor,
      });
    }
    const query = await client.execute({
      sql: `SELECT id, name, lastname, id_doctor, email, age, gender, medical_history, status, total_sessions, date_register FROM patients WHERE id_doctor = ?`,
      args: [id_doctor],
    });
      const patients = query.rows;
      if (patients.length === 0) {
          return res.status(400).json({
              message: 'No hay pacientes registrados'
          });
      }
      return res.status(200).json({
          message: 'Pacientes obtenidos exitosamente',
          users
      });
  } catch (error) {
    return res.status(500).json({
      message:"Error al obtener los pacientes",
      error,
    });
  }
}
async function getPatient(req = request, res = response) {
  const {id_patient} = req.params;
  try {
    const query1 = await client.execute({
      sql: `SELECT id FROM patients WHERE id = ?`,
      args: [id_patient],
    });
    const patient = query1.rows;
    if(patient.length === 0){
      return res.status(200).json({
        message: 'El paciente no existe o es incorrecto',
        patient,
      });
    }
    const query = await client.execute({
      sql: `SELECT id, name, lastname, id_doctor, email, age, gender, medical_history, status, total_sessions, date_register FROM patients WHERE id = ?`,
      args: [id_patient],
    });
      const patients = query.rows;
      return res.status(200).json({
          message: 'Paciente obtenido exitosamente',
          patients,
      });
  } catch (error) {
    return res.status(500).json({
      message:"Error al obtener los pacientes",
      error,
    });
  }
}
async function updatePatient(req = request, res = response) {
  const {id_patient} = req.params;
  try {
    const query1 = await client.execute({
      sql: `SELECT id FROM patients WHERE id = ?`,
      args: [id_patient]
      });
      const patient = query1.rows;
      //verify the existence of the product
      if (patient.length === 0)
            return res.status(200).json({
            message: "No existe el paciente o es incorrecto"
         });
  const array = parseUpdateArray("patients", req.body, {value: id_patient, index: "id"});
  await client.batch(array, "write");
  return res.status(200).json({
      message: "Paciente actualizado con exito",
  })
  } catch (error) {
    return res.status(500).json({
      message: 'Error al actualizar el paciente'
    })
  }
}
async function deletePatient(req = request, res = response) {
    const {id_patient} = req.params;
    try {
      const query1 = await client.execute({
        sql: `SELECT id FROM patients WHERE id = ?`,
        args: [id_patient]
        });
        const patient = query1.rows;
        //verify the existence of the product
        if (patient.length === 0)
              return res.status(200).json({
              message: "No existe el paciente o es incorrecto"
           });
           await client.batch([{
            sql: `DELETE FROM patients WHERE id = ?`,
            args: [id_patient],
        },{
            sql: `DELETE FROM results WHERE id_patient = ?`,
            args: [id_patient],
        },{
          sql: `DELETE FROM patient_responses WHERE id_patient = ?`,
          args: [id_patient],
        }], "write");
        return res.status(200).json({
            message:"Paciente eliminado con exito"
        })
    } catch (error) {
      return res.status(500).json({
        message: 'Error al eliminar el paciente',
        error,
      })
    }
}

async function login(req = request, res = response) {
  try {
    const { mail, password } = req.body;

    // Verificamos que ingresen datos
    if (!mail || !password)
      return res.status(404).json({
        info: {
          message: "mail y password son requeridos",
        },
      });

    // Verificamos si el usuario existe
    const user = await client.execute({
      sql: `SELECT id, password, name, email, lastname FROM patients WHERE email = ?`,
      args: [mail],
    });
    const resultUser = user.rows;
    if (!resultUser.length)
      return res.status(404).json({
        info: {
          message: "El usuario no existe",
        },
        errors: { mail: true, password: false },
      });

    // Comprobamos contraseñas
    const searchPass = await bcrypt.compare(password, resultUser[0].password);
    if (!searchPass)
      return res.status(400).json({
        info: {
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
          message: "Ingresado Correctamente",
        },
        data: {
          token,
          id: resultUser[0].id,
          name: resultUser[0].name,
          lastname: resultUser[0].lastname,
          mail: mail,
          rol: 'Patient',
        },
      });
  } catch (error) {
    return res.status(500).json({
      info: {
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
      sql: `SELECT id, name, email, lastname FROM patients WHERE id = ?`,
      args: [verify.id],
    });
    const resultUser = user.rows;
    return res.status(200).json({
      info: {
        message: "Usuario autenticado",
      },
      data: {
        id: resultUser[0].id,
        name: resultUser[0].name,
        lastname: resultUser[0].lastname,
        email: resultUser[0].email
      },
    });
  } catch (error) {
    return res.status(500).json({
      info: {
        message: "Error al ingresar",
        error,
      },
    });
  }
}

// async function login(req = request, res = response) {
//   try {
//     const {email, password } = req.body;
//     // Verificamos que ingresen datos
//     if (!email || !password)
//       return res.status(400).json({
//         info: {
//           message: "email y password son requeridos",
//         },
//       });
//     // Verificamos si el usuario existe
//     const user = await client.execute({
//       sql: `SELECT id, password, name, email, lastname FROM patients WHERE email = ?`,
//       args: [email.trim()],
//     });
//     const resultUser = user.rows;
//     if (!resultUser.length)
//       return res.status(404).json({
//         info: {
//           message: "El usuario no existe",
//         },
//         errors: { mail: true, password: false },
//       });

//     // Comprobamos contraseñas
//     const searchPass = await bcrypt.compare(password, resultUser[0].password);
//     if (!searchPass)
//       return res.status(400).json({
//         info: {
//           message: "Contraseña Incorrecta",
//         },
//         errors: { mail: false, password: true },
//       });

//     // Creamos el token
//     const token = await jwt.sign(
//       {
//         id: resultUser[0].id,
//       },
//       process.env.SECRET_KEY,
//       { expiresIn: process.env.JWT_EXPIRE }
//     );

//     // Enviamos el token
//     return res
//       .status(200)
//       .cookie("token", token)
//       .json({
//         info: {
//           message: "Ingresado Correctamente",
//         },
//         data: {
//           token,
//           id: resultUser[0].id,
//           name: resultUser[0].name,
//           lastname: resultUser[0].lastname,
//           email: email,
//         },
//       });
//   } catch (error) {
//     return res.status(500).json({
//       info: {
//         message: "Error al Ingresar",
//         error,
//       },
//       errors: { mail: false, password: false, error: true },
//     });
//   }
// }

// async function isLogin(req = request, res = response) {
//   const token = req.headers["authorization"];
  
//   try {
//     const verify = await jwt.verify(token, process.env.SECRET_KEY);
//     const user = await client.execute({
//       sql: `SELECT id, name, email, lastname, gender FROM patients WHERE id = ?`,
//       args: [verify.id],
//     });
//     const resultUser = user.rows;
//     return res.status(200).json({
//       info: {
//         message: "Usuario autenticado",
//       },
//       data: {
//         id: resultUser[0].id,
//         name: resultUser[0].name,
//         lastname: resultUser[0].lastname,
//         username: resultUser[0].username,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       info: {
//         message: "Error al ingresar",
//         error,
//       },
//     });
//   }
// }

module.exports = {
    createPatient,
    getPatients,
    getPatientsbyDoctor,
    getPatient,
    updatePatient,
    deletePatient,
    login,
    isLogin
}
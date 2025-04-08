const { request, response } = require('express');
const client = require('../database/connect.js');
const {generateCode} = require('../utils/generateCode.js');
const { parseInsertArray, parseUpdateArray } = require('../utils/sqlParse.js');

async function createAnswer(req = request, res = response) {
    try {
      const idgenerate = generateCode();
      const pre = await client.execute({
        sql: `SELECT id FROM questions WHERE id = ?`,
        args: {id_question}
      })
      const question = pre.rows;
      if(question.length === 0) {
        return res.status(200).json({
          message: "No existe la pregunta",
          pre
        })
      }
      let { answer, valor} = req.body;
      if(!answer, !valor){
        return res.status(400).json({
          message: "Ingrese los datos requeridos"
        })
      }
        const insert = parseInsertArray("answers", {
          id: idgenerate,
          answer: answer,
          valor: valor,
          id_question: question.id
        });
        await client.batch(insert, "write");
        return res.status(201).json({
          message: "Respuesta creada con éxito",
          insert
        })
    } catch (error) {
        return res.status(500).json({
          message: "Server error..."
        })
    }
}

async function getAnswer(params) {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(page) || 20;
    const answer = await client.batch(`SELECT * FROM answer ORDER BY id_question`);
    const resanswer = answer.rows;
    if(resanswer.length === 0) {
      return res.status(201).json({
        message: "No hay respuestas por mostrar",
        answer
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error..."
    })
  }
}
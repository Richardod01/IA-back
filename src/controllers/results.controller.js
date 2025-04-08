const { request, response } = require("express");
const client = require("../database/connect.js");
const { generateCode } = require("../utils/generateCode.js");
const { parseInsertArray, parseUpdateArray } = require("../utils/sqlParse.js");

async function createResultByPatient (req = request, res = response){
    const {average} = req.body;
    try {
        if(average === undefined){
            return res.status(400).json({
                message:"Ingresa el promedio"
            });
        }
        const query = await client.execute({
            sql:`SELECT status, txt FROM stadistics WHERE CAST(substr(range, 1, instr(range, ' - ') - 1) AS DECIMAL) <= ? AND CAST(substr(range, instr(range, ' - ') + 3) AS DECIMAL) >= ? LIMIT 1;`,
            args:[average, average]
        });
        const result = query.rows;
        return res.status(200).json({
            message:"Status obtenido correctamente",
            result
        });
    } catch (error) {
        return res.status(500).json({
            message:'Error al obtener el resultado',
            error
        });
    }
}
async function createAvarageByPacient(req = request, res = response) {
    const values = req.body.valores;
    try {
        if(values.length !== 10){
            return res.status(400).json({
                message: "Debes ingresar los 10 valores"
            });
        }
        const suma = values.reduce((acc, val) => acc + val, 0);
        const promedio = suma / values.length;
        return res.status(201).json({
            message:'Promedio generado con exito',
            promedio
        });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            message: "Error al generar el promedio",
            error
        });
    }
}

module.exports = {
    createResultByPatient,
    createAvarageByPacient
}
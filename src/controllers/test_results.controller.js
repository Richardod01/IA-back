const { request, response } = require("express");
const client = require("../database/connect");
const { parseInsertArray } = require("../utils/sqlParse");
const { generateCode } = require("../utils/generateCode");

async function addResult(req = request, res = response) {
    try {
        const verifyResult = await client.execute({
            sql: `SELECT number_test FROM tests WHERE id = ?`,
            args: [req.body.id_test],
        });
        const result = verifyResult.rows;
        if (result.length === 0) {
            return res.status(404).json({ message: "El test no existe", result, });
        }
        const insert = parseInsertArray("results", { id: generateCode(), id_patient: req.user.id, id_test: req.body.id_test, date_realization: req.body.date_realization, total_score: req.body.total_score, observations: req.body.observations });
        await client.batch(insert, "write");
        return res.status(201).json({ message: "Resultados del test guardadas con éxito", });
    } catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error, });
    }
}
async function getAllResults(req = request, res = response) {
    try {
        const {id} = req.params;
        if (req.user.rol === 'paciente') {
             return res.status(401).json({ message: "Los pacientes no tienen acceso a los resultados", });
        }
        const verifyResult = await client.execute({
            sql: `SELECT results.id AS id_result, results.id_patient AS id_patient, users.name AS name, users.lastname AS lastname, results.id_test AS id_test, results.date_realization AS date_realization, results.total_score AS total_score, results.observations AS observations FROM results JOIN users ON results.id_patient = users.id WHERE results.id_patient = ?`,
            args: [id],
        });
        const results = verifyResult.rows;
        if (results.length === 0) {
            return res.status(404).json({ message: "No existen resultados para mostrar", results, });
        }
        return res.status(200).json({ message: "Resultados del paciente obtenidos correctamente", results, });
    } catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error, });
    }
}
module.exports = {
    addResult,
    getAllResults,
}
const { request, response } = require('express');
const { client } = require('../database/connect.js');
const generateID = require('../utils/generateCode.js');
const { parseUpdateArray, parseInsertArray } = require('../utils/sqlParse.js');

//función para obtener todos los psicologos
async function getPsychologist(req = request, res = response) {
    try {
        const select = await client.execute(`SELECT * FROM psychologists`); // <- pedimos y obtenemos los datos de la BD con sql sin argumentos porque queremos todo
        const result = select.rows; // <- guardamos lo obtenido en una variable
        //verificamos que el psicologo exista:
        if (result.length === 0) {
            return res.status(200).json({ message: "No existe psicologos para mostrar", result });
        }
        //retornamos la respuesta junto con los datos requeridos:
        return res.status(200).json({ message: "Psicologos obtenidos correctamente", result });
    } catch (error) {
        return res.status(500).json({ message: "Error interno al obtener los psicologos", error });
    }
}

//funcion para obtener un psicologo por ID 
async function getPsychologistById(req = request, res = response) {
    const { id_psicologo } = req.params // <- respuesta parametro de la BD 
    try {
        const select = await client.execute({ // <- verificacion por id del psicologo //execute sacar batch subir
            sql: `SELECT id FROM psychologists WHERE id = ?`, // <- pedimos y sacamos datos de la BD con sql
            args: [id_psicologo],
        });
        const result = select.rows; // <- guardamos los datos obtenidos en una variable
        //verificamos la existencia del psicologo:
        if (result.length === 0) {
            return res.status(200).json({ message: "No existe el psicologo", result });
        }
        //Mostrar datos si existe:
        const select2 = await client.execute({ // <- pedimos y sacamos datos de la BD con sql
            sql: `SELECT * FROM psychologists WHERE id = ?`,
            args: [id_psicologo]
        });
        const result2 = select2.rows; // <- guardamos los datos obtenidos en una variable 
        return res.status(200).json({ message: "Psicologo obtenido correctamente", result2 }); // <- retornamos los datos obtenidos
    } catch (error) {
        return res.status(500).json({ message: "Error interno al obtener el psicologo", error });
    }
}

//funcion para crear psicologo
async function createPsychologists(req = request, res = response) {
    try {
        const { name, lastname, medical_specialty, email, age, gender } = req.body; // <- datos necesarios para crearlo
        const idGenerate = generateID(); // <- generar id al psicologo 
        // verificar que los existen:
        if (!name || !lastname || !medical_specialty || !email || !age || !gender) {
            return res.status(400).json({ message: "Todos los datos son requeridos" },)
        }
        //crear psicologo 
        const arraysalt = parseInsertArray("psychologists", {
            id: idGenerate(),
            name: name.trim(),
            lastname: lastname.trim(),
            medical_specialty: medical_specialty.trim(),
            email: email.trim(),
            age: age.trim(),
            gender: gender.trim(),
            date_register: date_register.trim()
        });
        //subimos a la Bd:
        await client.batch(arraysalt, "write");
        return res.status(200).json({ message: "Psicologo creado con éxito", arraysalt });// <- mostrar respuesta obtenida
    } catch (error) {
        return res.status(500).json({ message: "Error interno al crear al psicologo", error });
    }
}

//función para actualizar psicólogo
async function updatePsychologists(req = request, res = response) {
    const { id_psicologo } = req.params; //requiere parámetro de la BD // se actualiza el parámetro base al id
    try {
        //Pedimos y obtemos los datos de la BD en base a su id:
        const select = await client.execute({
            sql: `SELECT id FROM psychologists WHERE id = ?`,
            args: [id_psicologo]
        });
        // guardamos los datos en una variable:
        const result = select.rows;
        //verificamos que el usuario exista:
        if (result.length === 0) {
            return res.status(200).json({ message: "El psicologo no existe", result });
        }
        //actualizamos al psicologo
        const update = parseInsertArray("psychologists", req.body, { value: id_psicologo, index: "id" })
        await client.batch(update, "write");
        //mostrar respuesta si la operacion fue exitosa:
        return res.status(200).json({ message: "Psicologo actualizado con éxito" });
    } catch (error) {
        return res.status(500).json({ message: "Error interno al actualizar el psicologo", error });
    }
}

//funcion que elimina a un psicologo
async function deletePsychologists(req = request, res = respuest) {
    const { id_psicologo } = req.params //se elimina el parámetro de la BD
    try {
        //pedimos y obtemos los datos de la BD con sql en base a su id:
        const select = await client.execute({
            sql: `SELECT id FROM psychologists WHERE id = ?`,
            args: [id_psicologo]
        });
        //guardar los datos obtenidos en una variable: 
        const result = select.rows;
        //verificar que los datos existen:
        if (result.length === 0) {
            return res.status(200).json({ message: "El psicologo no existe", result });
        }
        //eliminado de la familia en base a su id:
        await client.batch({
            sql: `DELETE FROM psychologists WHERE id = ?`,
            args: [id_psicologo]
        }); //execute es obtener batch es modificar
        //mostrar respuesta si la operacion fue exitosa:
        return res.status(200).json({ message: "Psicologo eliminado" });
    } catch (error) {
        return res.status(500).json({ message: "Error interno al eliminar el psicologo" });
    }
}

module.exports = {
    getPsychologist,
    getPsychologistById,
    createPsychologists,
    updatePsychologists,
    deletePsychologists,
};




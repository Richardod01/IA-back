const { request, response } = require("express");
const client = require("../database/connect.js");
const { generateCode } = require("../utils/generateCode.js");
const { uploadImage, uploadVideo } = require("../utils/imgur.js");
const { parseInsertArray, parseUpdateArray } = require("../utils/sqlParse.js");
async function createImage(req = request, res = response) {
    const {id_test, id_question} = req.body;
    try {
        const verifyTest = await client.execute({
                sql:`SELECT id FROM tests WHERE id = ?`,
                args:[id_test]
            })
            const test = verifyTest.rows;
            if(test.length === 0){
                return res.status(200).json({
                    message:'No existe el test o es incorrecto',
                    test
                });
            }
            const verifyQues = await client.execute({
                sql:`SELECT id FROM questions WHERE id = ?`,
                args:[id_question]
            })
            const question = verifyQues.rows;
            if(question.length === 0){
                return res.status(200).json({
                    message:'No existe la pregunta o es incorrecta',
                    question
                });
            }
        if(req.file){
            const image = await uploadImage(req.file);
            req.body.image = image.data.link
        }
        if(req.body.image === undefined){
            return res.status(400).json({
                  message:"Debes agregar una imagen a la pregunta"
             });
           }
           req.body.id = generateCode();
           const array = parseInsertArray("test_images", {id:req.body.id, image: req.body.image, id_test: id_test || null, id_question: id_question || null});
           await client.batch(array, "write");
           return res.status(201).json({
               message: "Imagen creada con exito",
           });
    } catch (error) {
        return res.status(500).json({
            message: "Error al crear la imagen",
            error
        });
    }
}
async function getImagesByTest(req = request, res = response ) {
    const {id_test} = req.params;
    try {
        const query1 = await client.execute({
            sql:`SELECT id FROM tests WHERE id = ?`,
            args:[id_test],
        })
        const test = query1.rows;
        if(test.length === 0){
            return res.status(200).json({
                message: 'El test no existe o es incorrecto',
                test,
            });
        }
        const query3 = await client.execute({
            sql:`SELECT id, image, id_test, id_question FROM test_images WHERE id_test = ?`,
            args:[id_test],
        })
        const images = query3.rows;
        return res.status(200).json({
            message:'Imagenes obtenidas correctamente',
            images,
        });
    } catch (error) {
        return res.status(500).json({
            message:'Error al obtener las imagenes',
            error,
        })
    }
}
async function getImageByQuestion(req = request, res = response) {
    const {id_test, id_question} = req.params;
    try {
        const query1 = await client.execute({
            sql:`SELECT id FROM tests WHERE id = ?`,
            args:[id_test],
        })
        const test = query1.rows;
        if(test.length === 0){
            return res.status(200).json({
                message: 'El test no existe o es incorrecto',
                test,
            });
        }
        const query2 = await client.execute({
            sql:`SELECT id FROM questions WHERE id = ?`,
            args:[id_question],
        })
        const question = query2.rows;
        if(question.length === 0){
            return res.status(200).json({
                message: 'La pregunta no existe o es incorrecta',
                test,
            });
        }
        const query3 = await client.execute({
            sql:`SELECT image, id_question FROM test_images WHERE id_test = ? AND id_question = ?`,
            args:[id_test, id_question]
        });
        const image = query3.rows;
        return res.status(200).json({
            message: 'Imagen obtenida con exito',
            image
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener la imagen',
            error,
        })
    }
}
async function updateImage(req = request, res = response) {
    const {id_test_image} = req.params;
    try {
        const query1 = await client.execute({
            sql: `SELECT id FROM test_images WHERE id = ?`,
            args: [id_test_image]
            });
            const testIma = query1.rows;
            //verify the existence of the product
            if (testIma.length === 0)
                return res.status(200).json({
                    message: "No existe el registro o es incorrecto",
                    testIma,
            });
                if (req.file){
                   const image = await uploadImage(req.file);
                   req.body.image = image.data.link;
               }
        const array = parseUpdateArray("test_images", req.body, {value: id_test_image, index: "id"});
        await client.batch(array, "write");
        return res.status(200).json({
            message: "Producto actualizado",
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el registro',
            error,
        });
    }

}
module.exports = {
    createImage,
    getImagesByTest,
    getImageByQuestion,
    updateImage
}

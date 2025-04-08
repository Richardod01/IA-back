const { request, response } = require("express");
const client = require("../database/connect.js");
const { generateCode } = require("../utils/generateCode.js");
const { uploadImage, uploadVideo } = require("../utils/imgur.js");
const { parseInsertArray, parseUpdateArray } = require("../utils/sqlParse.js");
async function createVideo(req = request, res = response) {
    const {id_test, id_question} = req.params;
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
        if (req.file) {            
            const video = await uploadVideo(req.file);                                            
            req.body.video = video.data.link;    
          }          
      const array = parseInsertArray("test_videos", {
          id: generateCode(), 
          video: req.body.video, 
          id_test: req.body.id_test || null, 
          id_question: req.body.id_question || null
      });        
      await client.batch(array, "write");       
      return res.status(200).json({           
          message: "Video subido con éxito",           
          video: req.body.video
      });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Error al subir el video',
            error
        })    
    }
}

async function pruebaV(req = request, res = response) {
    try {
        if(req.file){
            const video = await uploadVideo(req.file);
            req.body.video = video.data.link;
        }
        const array = parseInsertArray("test_videos", {
            id: generateCode(), 
            video: req.body.video, 
            id_test: req.body.id_test || null, 
            id_question: req.body.id_question || null
        });        

        await client.batch(array, "write");        

        return res.status(200).json({           
            message: "Video subido con éxito",           
            video: req.body.video,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error al subir el video",
            error,
        })
    }
}
async function getVideosByTest(req = request, res = response ) {
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
            sql:`SELECT id, video, id_test, id_question FROM test_videos WHERE id_test = ?`,
            args:[id_test],
        })
        const videos = query3.rows;
        return res.status(200).json({
            message:'Videos obtenidos correctamente',
            videos,
        });
    } catch (error) {
        return res.status(500).json({
            message:'Error al obtener los videos',
            error,
        })
    }
}
async function getVideoByQuestion(req = request, res = response) {
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
            sql:`SELECT video, id_question FROM test_videos WHERE id_test = ? AND id_question = ?`,
            args:[id_test, id_question]
        });
        const video = query3.rows;
        return res.status(200).json({
            message: 'Video obtenido con exito',
            video
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener la imagen',
            error,
        })
    }
}
async function updateVideo(req = request, res = response) {
    const {id_test_video} = req.params;
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
        const array = parseUpdateArray("test_videos", req.body, {value: id_test_video, index: "id"});
        await client.batch(array, "write");
        return res.status(200).json({
            message: "Video actualizado",
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el registro',
            error,
        });
    }
}
module.exports = {
    createVideo,
    pruebaV,
    getVideosByTest,
    getVideoByQuestion,
    updateVideo
}
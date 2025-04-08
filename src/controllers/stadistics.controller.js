const { request, response } = require("express");

// Controlador para evaluar test psicológico
async function evaluatePsychTest(req = request, res = response) {
    try {
        const { answers } = req.body; // Respuestas del test (ej. [1, 4, 5, 3, 2, 6, 7, 8])

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "Por favor, proporcione una lista válida de respuestas."
            });
        }

        // Clasificación de niveles según las respuestas
        let score = answers.reduce((sum, answer) => sum + answer, 0);

        let resultCategory;
        if (score >= 1 && score <= 2) {
            resultCategory = "Sano";
        } else if (score >= 3 && score <= 4) {
            resultCategory = "Normal";
        } else if (score >= 5 && score <= 6) {
            resultCategory = "Ligeramente Trastornado";
        } else if (score >= 7 && score <= 8) {
            resultCategory = "Trastornado";
        } else if (score >= 9 && score <= 10) {
            resultCategory = "Muy Trastornado";
        } else {
            resultCategory = "No clasificado";
        }

        // Retornar la categoría y el puntaje total
        return res.status(200).json({
            message: "Evaluación completada con éxito",
            score: score,
            category: resultCategory
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error al evaluar el test psicológico",
            error,
        });
    }
}

module.exports = {
    evaluatePsychTest
};
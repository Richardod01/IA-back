const { request, response } = require('express');
const client = require('../database/connect.js');
const {generateCode} = require('../utils/generateCode.js');
const { parseInsertArray, parseUpdateArray } = require('../utils/sqlParse.js');

async function getResponsebyuser(req = request, res = response) {
    try {
        
    } catch (error) {
        return res.status(500).json({
            message: "Server error..."
        })
    }
}
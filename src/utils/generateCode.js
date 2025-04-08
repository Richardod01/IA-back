const crypto = require('crypto');
// Generate random code
const generateCode = () =>{
    return crypto.randomBytes(8).toString('hex');
}
module.exports = {generateCode}
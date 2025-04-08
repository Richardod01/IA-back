const express = require('express');
const cors = require('cors');
const path = require('path');
class Server {
    constructor() {
        this.app = express();
        this.middlewares();
        this.port = process.env.PORT;
        this.routes();
        this.server = require("http").createServer(this.app);
    }
    routes(){
        this.app.use('/users', require('../routes/users.routes.js'));
        this.app.use('/patients', require('../routes/patients.routes.js'));
        this.app.use('/test_videos', require('../routes/test_videos.routes.js'));
        this.app.use('/test_images', require('../routes/test_images.routes.js'));
        this.app.use('/results', require('../routes/results.routes.js'));
        this.app.use('/test_results', require('../routes/test_results.routes.js'));
    }
    middlewares(){
        this.app.use(cors());
        this.app.use(express.json());
    }
    listen(){
        this.server.listen(this.port, () => {
            console.log('Server running on port', this.port);
        });
    }
}
module.exports = Server;
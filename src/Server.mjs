'use strict';


import express from 'express';



export default class Server {


    constructor({
        config,
    }) {
        this.config = config;
        this.app = express();

        const portConfig = process.argv.find(item => item.startsWith('--port='));
        this.port = portConfig ? parseInt(portConfig.substr(7), 10) : this.config.port;

        this.enableCORS();
    }



    enableCORS() {
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "*");
            res.header("Access-Control-Allow-Methods", "*");

            if (req.method === 'options') res.status(200).end();
            else next();
        });

    }



    listen() {
        return new Promise((resolve, reject) => {
            this.app.listen(this.port, (err) => {
                if (err) reject(err);
                else resolve(this.port);
            });
        });
    }



    getApp() {
        return this.app;
    }
}
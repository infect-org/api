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
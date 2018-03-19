'use strict';


import express from 'express';



export default class Server {


    constructor({
        config,
    }) {
        this.config = config;
        this.app = express();
    }




    listen() {
        return new Promise((resolve, reject) => {
            this.app.listen(this.config.port, (err) => {
                if (err) reject(err);
                else resolve(this.config.port);
            });
        });
    }



    getApp() {
        return this.app;
    }
}
'use strict';


import express from 'express';
import log from 'ee-log';



export default class Server {


    constructor({
        config,
    }) {
        this.config = config;
        this.app = express();

        // disable crappy crap. e.g. don't send 
        // etags, some behaviors are cryzy like
        // caching of cors requests.
        this.app.set('etag', false);
        
        // add english as default language
        this.app.use((req, res, next) => {
            req.headers['accept-language'] += ',en; q=.1';
            next();
        });


        const portConfig = process.argv.find(item => item.startsWith('--port='));
        this.port = portConfig ? parseInt(portConfig.substr(7), 10) : this.config.port;

        this.enableCORS();
    }



    /**
    * shut down the server
    */
    close() {
        if (this.server) {
            return new Promise((resolve, reject) => {
                 this.server.close((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    }



    enableCORS() {
        this.app.use(function(req, res, next) {
            res.header('Access-Control-Allow-Origin', (req.headers.origin || '*'));
            res.header('Access-Control-Allow-Headers', 'select, filter');
            res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.header('Access-Control-Allow-Credentials', 'true');

            if (req.method === 'options') res.status(200).end();
            else next();
        });

    }



    listen() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, (err) => {
                if (err) reject(err);
                else resolve(this.port);
            });
        });
    }



    getApp() {
        return this.app;
    }
}

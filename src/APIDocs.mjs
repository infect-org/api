'use strict';

import nunjucks from 'nunjucks';
import dirname from './dirname';
import path from 'path';
import log from 'ee-log';
import markdown from 'nunjucks-markdown';
import marked from 'marked';
import express from 'express';





export default class APIDocs {



    constructor({
        config
    }) {
        this.config = config;
    }




    registerRoutes(app) {
        // templating
        this.env = nunjucks.configure(path.join(dirname.currentDir, '../www'), {
            autoescape: true,
            express: app
        });

        // add markdown suppoer
        markdown.register(this.env, marked);


        // serve static assets
        app.use(express.static(path.join(dirname.currentDir, '../www')));


        app.get('/', (request, response) => {
            response.render('services.html', this.getServices());
        });
    }



    getServices() {
        return {services: this.config.services};
    }
}
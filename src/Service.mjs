'use strict';


import Entity from './Entity';
import dirname from './dirname';
import fs from 'fs';
import util from 'util';
import path from 'path';
import SelectionParser from './SelectionParser';
import log from 'ee-log';




const readFile = util.promisify(fs.readFile);




export default class Service {


    constructor({
        schema,
        name,
        env,
    }) {
        this.name = name;
        this.schema = schema;
        this.env = env;

        this.entites = new Map();
    }




    async registerRoutes(app) {
        for (const entityConfig of this.schema) {

            // get data from fs
            const data = await readFile(path.join(dirname.currentDir, `../data/${this.env}/${entityConfig.name}.json`));

            const controller = new Entity({
                name: entityConfig.name,
                data: JSON.parse(data),
                config: entityConfig,
                serviceName: this.name,
            });

            this.entites.set(entityConfig.name, controller);



            app.get(`/${this.name}.${entityConfig.name}`, (request, response) => {
                this.handleRequest(request, response, entityConfig);
            });

            app.get(`/${this.name}.${entityConfig.name}/:id`, (request, response) => {
                this.handleRequest(request, response, entityConfig);
            });
        }
    }







    handleRequest(request, response, entityConfig) {
        const selection = new SelectionParser().parse(request);
        const languages = this.getRequestLanaguages(request);
        const controller = this.entites.get(entityConfig.name);

        const options = {
            languages: languages,
            selection: selection,
            id: request.params && request.params.id ? parseInt(request.params.id, 10) : null,
        };

        const method = options.id ? 'listOne' : 'list';

        controller[method](options).then((data) => {
            response.send(data);
        }).catch((err) => {
            log(err);

            if (err.httpCode) response.status(err.httpCode);
            response.send(err);
        });
    }





    getRequestLanaguages(request) {
        return this.parseRFCPrioritizedHeader(request.headers['accept-language']);
    }



    parseRFCPrioritizedHeader(headerText) {
        return headerText
            .split(/\s*,\s*/gi)
            .map((item) => {
                const parsed = /([a-z]{2})-?([a-z]{2})?(?:\s*;\s*q\s*=\s*)?([0-9\.]+)?/gi.exec(item);
                if (!parsed) return null;
                
                return {
                    language: (parsed[1] || '').toLowerCase().trim(),
                    country: (parsed[2] || '').toLowerCase().trim(),
                    priority: parsed[3] ? parseFloat(parsed[3]) : 1,
                };
            })
            .filter(item => item !== null)
            .sort((a, b) => a.priority < b.priority ? 1 : -1);
    }
}
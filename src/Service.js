import Entity from './Entity.js';
import fs from 'fs';
import util from 'util';
import path from 'path';
import SelectionParser from './SelectionParser.js';
import log from 'ee-log';
import type from 'ee-types';




const readFile = util.promisify(fs.readFile);




export default class Service {


    constructor({
        schema,
        name,
        env,
        port,
    }) {
        this.port = port;
        this.name = name;
        this.schema = schema;
        this.env = env;

        this.dirname = path.dirname(new URL(import.meta.url).pathname);

        this.entites = new Map();
    }




    async registerRoutes(router) {
        for (const entityConfig of this.schema) {

            // get data from fs
            const data = await readFile(path.join(this.dirname, `../data/${this.env}/${entityConfig.name}.json`));

            const controller = new Entity({
                name: entityConfig.name,
                data: JSON.parse(data),
                config: entityConfig,
                serviceName: this.name,
                port: this.port,
            });

            this.entites.set(entityConfig.name, controller);



            router.get(`/${this.name}.${entityConfig.name}`, (request) => {
                this.handleRequest(request, entityConfig);
            });

            router.get(`/${this.name}.${entityConfig.name}/:id`, (request) => {
                this.handleRequest(request, entityConfig);
            });

            // new api style
            router.get(`/core-data/v1/${this.name}.${entityConfig.name}`, (request) => {
                this.handleRequest(request, entityConfig);
            });

            router.get(`/core-data/v1/${this.name}.${entityConfig.name}/:id`, (request) => {
                this.handleRequest(request, entityConfig);
            });
        }
    }







    handleRequest(request, entityConfig) {
        const selection = new SelectionParser().parse(request);
        const languages = this.getRequestLanaguages(request);
        const controller = this.entites.get(entityConfig.name);

        const options = {
            languages: languages,
            selection: selection,
            id: request.hasParameter('id') ? parseInt(request.getParameter('id'), 10) : null,
        };

        const method = options.id ? 'listOne' : 'list';

        controller[method](options).then((data) => {
            data = this.handleFilter(request.getHeader('filter'), data);

            request.response().send(data);
        }).catch((err) => {
            log(err);

            if (err.httpCode) request.response().status(err.httpCode);
            request.response().send(err);
        });
    }




    /**
    * filter the data after it was loaded: because
    * it's simple and fast implemented.
    */
    handleFilter(filterHeader, rows) {
        if (filterHeader && rows && rows.length) {
            const filters = filterHeader.split(/\s*,\s*/gi);

            for (const filter of filters) {
                const filterParts = /\s*([a-z0-9_\.]+)\s*([=<>])\s*(.*)/gi.exec(filter);

                if (filterParts) {
                    let value = filterParts[3].trim();

                    // unescape commas
                    value = value.replace(/;;/g, ',');

                    if (value !== '') {
                        if (!(/[^0-9]/gi.test(value))) value = parseInt(value, 10);
                        else if (!(/[^0-9\.]/gi.test(value))) value = parseFloat(value);
                        else if (value.toLowerCase() === 'null') value = null;
                        else if (value.toLowerCase() === 'not null') value = null;
                        else if (value.toLowerCase() === 'true') value = true;
                        else if (value.toLowerCase() === 'false') value = false;
                        else if (/^["'].*["']$/gi.test(value)) value = value.substr(1, value.length - 2);
                    }
                    
                    // start filtering
                    rows = rows.filter(item => this.satisfiesFilter(item, filterParts[1].split('.'), filterParts[2].trim(), value));
                } else throw new Error(`Failed to parse filter '${filter}'!`);
            }
        }

        return rows;
    }





    satisfiesFilter(item, filterPath, comparator, value) {
        if (filterPath.length === 1) {

            // lets compare values
            switch (comparator) {
                case '=':
                    return item[filterPath[0]] == value;
                case '>':
                    return item[filterPath[0]] > value;
                case '<':
                    return item[filterPath[0]] < value;
                default: 
                    throw new Error(`Unknown filter comparator '${comparator}'!`);
            }
        } else if (filterPath.length > 1) {
            const localEntity = item[filterPath[0]];

            if (type.array(localEntity)) {
                return localEntity.some(item => this.satisfiesFilter(item, filterPath.slice(1), comparator, value));
            } else if (type.object(localEntity)) {
                return this.satisfiesFilter(localEntity, filterPath.slice(1), comparator, value);
            } else if (type.undefined(localEntity)) {
                return false;
            } else throw new Error(`Cannot follow path into entity ${filterPath[0]}, it is not an entity but typof ${type(localEntity)}!`);
        } else return false;
    }







    getRequestLanaguages(request) {
        return this.parseRFCPrioritizedHeader(request.getHeader('accept-language'));
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
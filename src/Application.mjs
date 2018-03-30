'use strict';

import Server from './Server';
import Service from './Service';
import envr from 'envr';
import path from 'path';
import dirname from './dirname';
import APIDocs from './APIDocs';




export default class Application {


    constructor() {
        this.env = process.argv.includes('--data-for-dev') ? 'development' : (
            process.argv.includes('--data-for-beta') ? 'development' : (
                process.argv.includes('--data-for-production') ? 'production' : ''
            )
        );

        this.config = envr.config(path.join(dirname.currentDir, '../config/server/'), path.join(dirname.currentDir, '../'));
        this.services = new Map();


        this.apiDocs = new APIDocs({
            config: this.config
        });


        this.server = new Server({
            config: this.config
        });
    }





    async listen() {
        const port = await this.server.listen();

        // set up the services
        for (const service of this.config.services) {
            const instance = new Service({
                schema: service.schema,
                name: service.name,
                env: this.env,
                port: port,
            });

            this.services.set(service.name, instance);

            await instance.registerRoutes(this.server.getApp());
        }


        // register api docs endpoint
        await this.apiDocs.registerRoutes(this.server.getApp());

        return port;
    }
}
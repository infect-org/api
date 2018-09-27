import Server from './Server';
import Service from './Service';
import envr from 'envr';
import path from 'path';
import APIDocs from './APIDocs';




export default class Application {


    constructor() {
        this.env = process.argv.includes('--data-for-dev') ? 'development' : (
            process.argv.includes('--data-for-beta') ? 'development' : (
                process.argv.includes('--data-for-production') ? 'production' : ''
            )
        );

        this.dirname = path.dirname(new URL(import.meta.url).pathname);

        this.config = envr.config(path.join(this.dirname, '../config/server/'), path.join(this.dirname, '../'));
        this.services = new Map();


        this.apiDocs = new APIDocs({
            config: this.config
        });


        this.server = new Server({
            config: this.config
        });
    }




    getPort() {
        return this.port;
    }


    async load() {
        return await this.listen();
    }



    async end() {
        return await this.server.close();
    }




    async listen() {
        this.port = await this.server.listen();

        // set up the services
        for (const service of this.config.services) {
            const instance = new Service({
                schema: service.schema,
                name: service.name,
                env: this.env,
                port: this.port,
            });

            this.services.set(service.name, instance);

            await instance.registerRoutes(this.server.getRouter());
        }


        // register api docs endpoint
        await this.apiDocs.registerRoutes(this.server.getRouter());

        return this.port;
    }
}
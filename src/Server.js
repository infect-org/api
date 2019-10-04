import HTTP2Server from '@distributed-systems/http2-server';
import log from 'ee-log';



export default class Server {


    constructor({
        config,
    }) {
        this.config = config;

        // start an insecure server
        this.server = new HTTP2Server({
            secure: false,
        });

        // add middlewares
        this.addMiddlewares();
        
        const portConfig = process.argv.find(item => item.startsWith('--port='));
        this.port = portConfig ? parseInt(portConfig.substr(7), 10) : this.config.get('server.port');
    }



    /**
    * register middlewares on the server
    */
    addMiddlewares() {

        // add english as default language
        this.server.registerMiddleware(async (request) => {
            if (request.hasHeader('accept-language')) {
                request.setHeader('accept-language', request.getHeader('accept-language') + ',en; q=.1');
            } else {
                request.setHeader('accept-language', 'en; q=.1');
            }
        });

        // cors
        this.server.registerMiddleware(async (request) => {
            request.response().setHeaders([
                ['Access-Control-Allow-Origin', (request.getHeader('origin') || '*')],
                ['Access-Control-Allow-Headers', 'select, filter'],
                ['Access-Control-Allow-Methods', 'GET, OPTIONS'],
                ['Access-Control-Allow-Credentials', 'true'],
            ]);

            if (request.method('options')) {
                request.response.status(200).send();
                return false;
            }
        });
    }




    /**
    * start the web server, use the port passed by the --port argv
    * or the port passed to the function or a random free port
    */
    async listen(port) {
        this.port = this.port || port || await this.portFinder.getPort();
        
        await this.server.listen(this.port);

        log.info(`Server is listeningon port ${this.port}`);
        return this.port;
    }





    /**
    * shut down the server
    */
    async close() {
        await this.server.close();
    }




    /**
     * return the servers router
     *
     * @return     {router}  The router.
     */
    getRouter() {
        return this.server.getRouter();
    }




    /**
    * returns the express app
    */
    getServer() {
        return this.server;
    }
}

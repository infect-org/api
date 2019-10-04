import nunjucks from 'nunjucks';
import path from 'path';
import log from 'ee-log';
import markdown from 'nunjucks-markdown';
import marked from 'marked';





export default class APIDocs {



    constructor({
        config
    }) {
        this.config = config;
        this.dirname = path.dirname(new URL(import.meta.url).pathname);
    }




    registerRoutes(router) {
        // templating
        this.env = nunjucks.configure(path.join(this.dirname, '../www'), {
            autoescape: true
        });

        // add markdown suppoer
        markdown.register(this.env, marked);


        router.get('/', (request) => {
            const data = this.env.render('services.html', this.getServices());
            request.response()
                .status(200)
                .setHeader('content-type', 'text/html')
                .send(data);
        });
    }



    getServices() {
        return {
            services: this.config.services
        };
    }
}
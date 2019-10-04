'use strict';


import log from 'ee-log';
import Application from './index.js';


const app = new Application();


app.load().then((port) => {
    log.success(`listening on port ${port}`);
    log.info(`Visit http://l.dns.porn:${port}/ for API docs`);
}).catch(log);


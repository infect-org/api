'use strict';


import log from 'ee-log';
import Application from './src/Application';


const app = new Application();


app.listen().then((port) => {
    log.success(`listening on port ${port}`);
}).catch(log);


'use strict';


import DataLoader from './lib/GoogleDataLoader';
import log from 'ee-log';


const loader = new DataLoader();

loader.download().then(() => {
    log.success('data update complete!')
}).catch(log);
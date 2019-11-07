'use strict';


import Importer from './lib/CSVImporter.js';
import log from 'ee-log';


const importer = new Importer();

importer.import().then(() => {
    log.success('data update complete!')
}).catch(log);
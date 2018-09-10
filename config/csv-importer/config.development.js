'use strict';

const envr = require('envr');
const path = require('path');


module.exports = {
    sourceDir: path.join(__dirname, '../../temp'),
    targetDir: path.join(__dirname, '../../data'),
    csvFiles: [{
		fileName: 'import_summary_all',
        country: 'ch',
        region: 'switzerland-all',
    }, {
		fileName: 'import_summary_switzerland-central-east',
        country: 'ch',
        region: 'switzerland-central-east',
    }, {
		fileName: 'import_summary_switzerland-central-west',
        country: 'ch',
        region: 'switzerland-central-west',
    }, {
		fileName: 'import_summary_switzerland-east',
        country: 'ch',
        region: 'switzerland-east',
    }, {
		fileName: 'import_summary_switzerland-geneva',
        country: 'ch',
        region: 'switzerland-geneva',
    }, {
		fileName: 'import_summary_switzerland-east',
        country: 'ch',
        region: 'switzerland-north-east',
    }, {
		fileName: 'import_summary_switzerland-west',
        country: 'ch',
        region: 'switzerland-north-west',
    }, {
		fileName: 'import_summary_switzerland-south',
        country: 'ch',
        region: 'switzerland-south',
    }, {
		fileName: 'import_summary_switzerland-west',
        country: 'ch',
        region: 'switzerland-west',
    }],
};
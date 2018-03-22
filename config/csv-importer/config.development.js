'use strict';

const envr = require('envr');
const path = require('path');


module.exports = {
    sourceDir: path.join(__dirname, '../../temp'),
    targetDir: path.join(__dirname, '../../data'),
    csvFiles: [{
		fileName: 'beta_import_summary_all',
        country: 'ch',
        region: 'switzerland-all',
    }, {
		fileName: 'beta_import_summary_Central_East',
        country: 'ch',
        region: 'switzerland-central-east',
    }, {
		fileName: 'beta_import_summary_Central_West',
        country: 'ch',
        region: 'switzerland-central-west',
    }, {
		fileName: 'beta_import_summary_East',
        country: 'ch',
        region: 'switzerland-east',
    }, {
		fileName: 'beta_import_summary_Geneva area',
        country: 'ch',
        region: 'switzerland-geneva',
    }, {
		fileName: 'beta_import_summary_North_East',
        country: 'ch',
        region: 'switzerland-north-east',
    }, {
		fileName: 'beta_import_summary_North_West',
        country: 'ch',
        region: 'switzerland-north-west',
    }, {
		fileName: 'beta_import_summary_South',
        country: 'ch',
        region: 'switzerland-south',
    }, {
		fileName: 'beta_import_summary_West',
        country: 'ch',
        region: 'switzerland-west',
    }],
};
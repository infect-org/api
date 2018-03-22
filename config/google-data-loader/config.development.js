'use strict';

const envr = require('envr');


module.exports = {
    googleApiEmail      : 'spreadsheet-client@infect-198420.iam.gserviceaccount.com',
    googleApiPrivateKey : envr.get('privateKey'),
    spreadsheetId       : envr.get('spreadsheetId'),
    sheets: [{
        name: 'substanceClass',
        columns: [{
            googleName: 'identifier',
            name: 'identifier',
        }, {
            googleName: 'parentidentifier',
            name: 'parentiIdentifier',
            foreignKey: {
                sheet: 'substanceClass',
                column: 'identifier',
                name: 'id_parentSubstanceClass',
            },
        }, {
            googleName: 'colorrgb',
            name: 'color',
        }],
        translations: ['de', 'fr', 'it', 'en'],
    }, {
        name: 'substance',
        columns: [{
            googleName: 'identifier',
            name: 'identifier',
        }, {
            googleName: 'substanceclassidentifier',
            name: 'substanceClass',
            foreignKey: {
                sheet: 'substanceClass',
                column: 'identifier',
            },
        }],
    }, {
        name: 'compound',
        columns: [{
            googleName: 'identifier',
            name: 'identifier',
        }, {
            googleName: 'peros',
            name: 'perOs',
        }, {
            googleName: 'intravenous',
            name: 'intravenous',
        }, {
            googleName: 'substance1',
            name: 'substance1',
            foreignKey: {
                sheet: 'substance',
                column: 'identifier',
                name: 'id_substance1',
            },
        }, {
            googleName: 'substance2',
            name: 'substance2',
            foreignKey: {
                sheet: 'substance',
                column: 'identifier',
                name: 'id_substance2',
            },
        }, {
            googleName: 'substance3',
            name: 'substance3',
            foreignKey: {
                sheet: 'substance',
                column: 'identifier',
                name: 'id_substance3',
            },
        }],
        translations: ['de', 'fr', 'it', 'en'],
    }, {
        name: 'bacteria',
        columns: [{
            googleName: 'species',
            name: 'species',
            foreignKey: {
                sheet: 'species',
                column: 'identifier',
            },
        }, {
            googleName: 'shape',
            name: 'shape',
            foreignKey: {
                sheet: 'shape',
                column: 'identifier',
            },
        }, {
            googleName: 'grouping',
            name: 'grouping',
            foreignKey: {
                sheet: 'grouping',
                column: 'identifier',
            },
        }, {
            googleName: 'gram',
            name: 'gramPositive',
        }, {
            googleName: 'aerobic',
            name: 'aerobic',
        }, {
            googleName: 'anaerobic',
            name: 'anaerobic',
        }, {
            googleName: 'aerobicoptional',
            name: 'aerobicOptional',
        }, {
            googleName: 'anaerobicoptional',
            name: 'anaerobicOptional',
        }],
        translations: ['de', 'fr', 'it', 'en'],
    }, {
        name: 'species',
        columns: [{
            googleName: 'identifier',
            name: 'identifier',
        }, {
            googleName: 'name',
            name: 'name',
        }, {
            googleName: 'genusidentifier',
            name: 'genus',
            foreignKey: {
                sheet: 'genus',
                column: 'identifier',
            },
        }],
    }, {
        name: 'genus',
        columns: [{
            googleName: 'identifier',
            name: 'identifier',
        }, {
            googleName: 'name',
            name: 'name',
        }],
    }, {
        name: 'shape',
        columns: [{
            googleName: 'identifier',
            name: 'identifier',
        }],
        translations: ['de', 'fr', 'it', 'en'],
    }, {
        name: 'grouping',
        columns: [{
            googleName: 'identifier',
            name: 'identifier',
        }],
        translations: ['de', 'fr', 'it', 'en'],
    }]
};
'use strict';

const envr = require('envr');


const remoteserviceURL = 'http://l.dns.porn:8000';

module.exports = {
    port: 8000,
    services: [{
        name: 'pathogen',
        schema: [{
            name: 'bacteria',
            relations: [{
                type: 'hasOne',
                remoteService: 'pathogen',
                remoteEntity: 'species',
                remoteKey: 'id',
                localKey: 'id_species',
                url: remoteserviceURL,
            }, {
                type: 'hasOne',
                remoteService: 'pathogen',
                remoteEntity: 'shape',
                remoteKey: 'id',
                localKey: 'id_shape',
                url: remoteserviceURL,
            }, {
                type: 'hasOne',
                remoteService: 'pathogen',
                remoteEntity: 'grouping',
                remoteKey: 'id',
                localKey: 'id_grouping',
                url: remoteserviceURL,
            }]
        }, {
            name: 'species',
            relations: [{
                type: 'hasOne',
                remoteService: 'pathogen',
                remoteEntity: 'genus',
                remoteKey: 'id',
                localKey: 'id_genus',
                url: remoteserviceURL,
            }, {
                type: 'belongsToMany',
                remoteService: 'pathogen',
                remoteEntity: 'bacteria',
                localKey: 'id',
                remoteKey: 'id_species',
                url: remoteserviceURL,
            }]
        }, {
            name: 'genus',
            relations: [{
                type: 'belongsToMany',
                remoteService: 'pathogen',
                remoteEntity: 'species',
                localKey: 'id',
                remoteKey: 'id_genus',
                url: remoteserviceURL,
            }]
        }, {
            name: 'shape',
            relations: [{
                type: 'belongsToMany',
                remoteService: 'pathogen',
                remoteEntity: 'bacteria',
                localKey: 'id',
                remoteKey: 'id_shape',
                url: remoteserviceURL,
            }]
        }, {
            name: 'grouping',
            relations: [{
                type: 'belongsToMany',
                remoteService: 'pathogen',
                remoteEntity: 'bacteria',
                localKey: 'id',
                remoteKey: 'id_grouping',
                url: remoteserviceURL,
            }]
        }]
    }, {
        name: 'substance',
        schema: [{
            name: 'compound',
            relations: [{
                type: 'hasMany',
                remoteService: 'substance',
                remoteEntity: 'substance',
                remoteKey: 'id',
                localKey: 'id',
                via: {
                    remoteService: 'substance',
                    remoteEntity: 'compound_substance',
                    localKey: 'id_compound',
                    remoteKey: 'id_substance',
                    url: remoteserviceURL,
                },
                url: remoteserviceURL,
            }, {
                type: 'belongsToMany',
                remoteService: 'substance',
                remoteEntity: 'compound_substance',
                localKey: 'id',
                remoteKey: 'id_compound',
                url: remoteserviceURL,
            }]
        }, {
            name: 'substanceClass',
            relations: [{
                type: 'belongsToMany',
                remoteService: 'substance',
                remoteEntity: 'substance',
                localKey: 'id',
                remoteKey: 'id_substanceClass',
                url: remoteserviceURL,
            }]
        }, {
            name: 'substance',
            relations: [{
                type: 'hasOne',
                remoteService: 'substance',
                remoteEntity: 'substanceClass',
                remoteKey: 'id',
                localKey: 'id_substanceClass',
                url: remoteserviceURL,
            }, {
                type: 'belongsToMany',
                remoteService: 'substance',
                remoteEntity: 'compound_substance',
                localKey: 'id',
                remoteKey: 'id_substance',
                url: remoteserviceURL,
            }]
        }, {
            name: 'compound_substance',
            relations: [{
                type: 'hasOne',
                remoteService: 'substance',
                remoteEntity: 'compound',
                remoteKey: 'id',
                localKey: 'id_compound',
                url: remoteserviceURL,
            }, {
                type: 'hasOne',
                remoteService: 'substance',
                remoteEntity: 'substance',
                remoteKey: 'id',
                localKey: 'id_substance',
                url: remoteserviceURL,
            }]
        }]
    }]
};
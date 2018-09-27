'use strict';

const envr = require('envr');


const remoteserviceURL = 'http://l.dns.porn';

module.exports = {
    port: 1234,
    services: [{
        name: 'pathogen',
        schema: [{
            name: 'bacterium',
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
            }, {
                type: 'belongsToMany',
                remoteService: 'rda',
                remoteEntity: 'resistance',
                localKey: 'id',
                remoteKey: 'id_bacterium',
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
                remoteEntity: 'bacterium',
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
                remoteEntity: 'bacterium',
                localKey: 'id',
                remoteKey: 'id_shape',
                url: remoteserviceURL,
            }]
        }, {
            name: 'grouping',
            relations: [{
                type: 'belongsToMany',
                remoteService: 'pathogen',
                remoteEntity: 'bacterium',
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
            }, {
                type: 'belongsToMany',
                remoteService: 'rda',
                remoteEntity: 'resistance',
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
    }, {
        name: 'rda',
        schema: [{
            name: 'resistance',
            relations: [{
                type: 'hasOne',
                remoteService: 'generics',
                remoteEntity: 'region',
                remoteKey: 'id',
                localKey: 'id_region',
                url: remoteserviceURL,
            }, {
                type: 'hasOne',
                remoteService: 'generics',
                remoteEntity: 'country',
                remoteKey: 'id',
                localKey: 'id_country',
                url: remoteserviceURL,
            }, {
                type: 'hasOne',
                remoteService: 'pathogen',
                remoteEntity: 'bacterium',
                remoteKey: 'id',
                localKey: 'id_bacterium',
                url: remoteserviceURL,
            }, {
                type: 'hasOne',
                remoteService: 'substance',
                remoteEntity: 'compound',
                remoteKey: 'id',
                localKey: 'id_compound',
                url: remoteserviceURL,
            }]
        }]
    }, {
        name: 'generics',
        schema: [{
            name: 'region',
            relations: [{
                type: 'belongsToMany',
                remoteService: 'rda',
                remoteEntity: 'resistance',
                localKey: 'id',
                remoteKey: 'id_region',
                url: remoteserviceURL,
            }]
        }, {
            name: 'country',
            relations: [{
                type: 'belongsToMany',
                remoteService: 'rda',
                remoteEntity: 'resistance',
                localKey: 'id',
                remoteKey: 'id_country',
                url: remoteserviceURL,
            }]
        }, {
            name: 'ageGroup',
        }, {
            name: 'hospitalStatus',
        }]
    }, {
        name: 'anresis',
        schema: [{
            name: 'regionMapping',
            relations: [{
                type: 'hasOne',
                remoteService: 'generics',
                remoteEntity: 'region',
                remoteKey: 'id',
                localKey: 'id_region',
                url: remoteserviceURL,
            }]
        }, {
            name: 'antibioticMapping',
            relations: [{
                type: 'hasOne',
                remoteService: 'substance',
                remoteEntity: 'compound',
                remoteKey: 'id',
                localKey: 'id_compound',
                url: remoteserviceURL,
            }]
        }, {
            name: 'bacteriumMapping',
            relations: [{
                type: 'hasOne',
                remoteService: 'pathogen',
                remoteEntity: 'bacterium',
                remoteKey: 'id',
                localKey: 'id_bacterium',
                url: remoteserviceURL,
            }]
        }]
    }]
};
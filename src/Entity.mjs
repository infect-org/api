import log from 'ee-log';
import HTTP2Client from '@distributed-systems/http2-client'

import {
    NotFoundError,
    BadRequestError,
} from './Error'






export default class Entity {


    constructor({
        name,
        data,
        config,
        serviceName,
        port,
    }) {
        this.port = port;
        this.config = config;
        this.name = name;
        this.data = data;
        this.serviceName = serviceName;

        this.httpClient = new HTTP2Client();

        this.relations = new Map();

        if (this.config.relations) {
            this.config.relations.forEach((relation) => {
                this.relations.set(`${relation.remoteService}.${relation.remoteEntity}`, relation);
            });
        }
    }





    async list({
        languages,
        selection,
    }) {
        const rows = this.data.map(item => Object.assign({}, item));
        this.translate(rows, languages);

        await this.resolveRelations({
            languages,
            selection,
            rows,
        });

        return rows;
    }





    async listOne({
        id,
        languages,
        selection,
    }) {
        const rows = this.data.filter(item => item.id == id);
        this.translate(rows, languages);

        await this.resolveRelations({
            languages,
            selection,
            rows,
        });

        if (rows.length) return rows[0];
        else throw NotFoundError(`The record with the id ${id} was not found!`);
    }






    async resolveRelations({
        selection,
        languages,
        rows,
    }) {
        await Promise.all(Array.from(selection.children.entries()).map(async ([selectionName, childSelection]) => {
            if (!selectionName.includes(':')) selectionName = `${this.serviceName}.${selectionName}`;
            else selectionName = selectionName.replace(':', '.');

            if (this.relations.has(selectionName)) {
                const definition = this.relations.get(selectionName);
                

                const remoteData = await this.request({
                    selection: childSelection.properties.slice(),
                    languages: languages,
                    definition: definition,
                    children: childSelection.children,
                    remoteMode: definition.type === 'belongsToMany'
                });


                if (definition.type === 'hasMany') {
                    const viaData = await this.request({
                        selection: [],
                        languages: languages,
                        definition: definition,
                        via: true,
                    });

                    rows.forEach((row) => {
                        if (row[definition.localKey]) {
                            const mappings = viaData.get(row[definition.localKey]);

                            if (mappings) {
                                row[definition.remoteEntity] = mappings.map(mapping => remoteData.get(mapping[definition.via.remoteKey]));
                            }
                        }
                    });
                } else if (definition.type === 'hasOne') {
                    rows.forEach((row) => {
                        if (row[definition.localKey]) {

                            if (remoteData.has(row[definition.localKey])) {
                                row[definition.remoteEntity] = remoteData.get(row[definition.localKey]);
                            }
                        }
                    });
                } else if (definition.type === 'belongsToMany') {
                    rows.forEach((row) => {
                        if (row[definition.localKey]) {
                            const remotes = remoteData.get(row[definition.localKey]);

                            if (remotes) {
                                row[definition.remoteEntity] = remotes;
                            }
                        }
                    });
                }
            } else throw new BadRequestError(`Cannot resolve relation ${selectionName} on ${this.serviceName}.${this.name}!`);
        }));
    }











    async request({
        selection,
        languages,
        definition,
        via = false,
        remoteMode = false,
        children,
    }) {
        if (via) {
            selection.push(definition.via.localKey);
            selection.push(definition.via.remoteKey);
        } else {
            selection.push(definition.remoteKey);
        }


        if (children) {
            this.compactSelection(children, selection, '');
        }

        const headers = {
            accept: 'application/json',
            select: selection.join(', ')
        };

        headers['accept-language'] = languages.map(item => `${item.language}${item.country ? '-'+item.country : ''};q=${item.priority}`).join(', ');

        const url = `${definition.url}:${this.port}/${via ? definition.via.remoteService : definition.remoteService}.${via ? definition.via.remoteEntity : definition.remoteEntity}`;
        let response = await this.httpClient.get(url)
            .setHeaders(headers)
            .send();

        const data = await response.getData();

        if (via) {
            const map = new Map();

            data.forEach((item) => {
                if (!map.has(item[definition.via.localKey])) map.set(item[definition.via.localKey], []);
                map.get(item[definition.via.localKey]).push(item);
            });

            return map;
        } else if (remoteMode) {
            const map = new Map();

            data.forEach((item) => {
                if (!map.has(item[definition.remoteKey])) map.set(item[definition.remoteKey], []);
                map.get(item[definition.remoteKey]).push(item);
            });

            return map;
        } else return new Map(data.map(item => ([item[definition.remoteKey], item])));
    }





    compactSelection(childMap, selection, parentString) {
        for (const [childName, child] of childMap) {
            for (const property of child.properties) {
                selection.push(`${parentString}${childName}.${property}`);
            }

            this.compactSelection(child.children, selection, `${parentString}${childName}.`);
        }
    }





    translate(rows, languages) {
        for (const row of rows) {
            if (row.translations) {
                for (const {language} of languages) {
                    for (const translation of row.translations) {
                        if (row.translations.some(translation => translation.language === language)) {
                            row.name = translation.value;
                        }
                    }
                }
            }

            delete row.translations;
        }
    }
}

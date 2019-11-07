'use strict';


import SpreadSheet from 'google-spreadsheet';
import envr from 'envr';
import path from 'path';
import log from 'ee-log';
import type from 'ee-types';
import util from 'util';
import fs from 'fs';
import IDMapping from './GoogleIDMapping.js';



const dirname = path.dirname(new URL(import.meta.url).pathname);
const writeFile = util.promisify(fs.writeFile);




export default class DataLoader {

    constructor() {

        // load environemnt specific config file
        this.config = envr.config(path.join(dirname, '../../config/google-data-loader/'), path.join(dirname, '../../'));

        // set up a spreadsheet instance
        this.sheet = new SpreadSheet(this.config.spreadsheetId);

        // sheet mappings must be retreived from the api
        this.sheets = new Map();

        // we're trying to get consistent ids that won't change if 
        // rows are moved in the google sheet
        this.idMappings = new IDMapping();

        // the data env to use
        this.env = process.argv.includes('--to-dev') ? 'development' : (
            process.argv.includes('--to-beta') ? 'beta' : (
                process.argv.includes('--to-production') ? 'production' : ''
            )
        );

        if (!this.env) throw new Error(`Failed to identify the data env. Please specific it using one of the following flags: --to-dev, --to-beta, --to-production`);
    }







    /**
    * get all data from the data master and store
    * them in the target environemtn storage directory
    */
    async download() {
        await this.authenticate();
        await this.loadInfo();
        await this.idMappings.load(this.env);


        this.data = new Map();

        for (const sheetConfig of this.config.sheets) {
            const rows = await this.getRows(sheetConfig);
            this.data.set(sheetConfig.name, rows);
        }

        // resolve relations
        this.resolveForeignKeys();


        // convert the substance class entity to an
        // ordered nested set
        this.createOrderedNestedSet('substanceClass', 'id_parentSubstanceClass', 'id');


        // the references to the substance on the compound need
        // to be moved into a mapping
        this.data.set('compound_substance', this.createMappingEntity({
            rows: this.data.get('compound'),
            columns: ['id_substance1', 'id_substance2', 'id_substance3'],
            localColumn: 'id_compound', 
            remoteColumn: 'id_substance', 
        }));

        
        // nice, that's it, we've gotten all data and were able
        // to normalize it. its time to write them to the files
        await this.storeData();

        // store id mapping
        await this.idMappings.save();
    }







    /**
    * store the data in files
    */
    async storeData() {
        log.info(`Storing data files ...`);
        log.wtf(`Env: ${this.env}`);

        for (const [name, data] of this.data.entries()) {
            const fileName = path.join(dirname, `../../data/${this.env}/${name}.json`);

            log.debug(`Storing ${data.length} records in file ${fileName} ...`);
            await writeFile(fileName, JSON.stringify(data, null, 4));
        }
    }






    /**
    * create a mapping entity from a multi-selection
    */
    createMappingEntity({
        rows,
        columns,
        localColumn,
        remoteColumn,
    }) {
        const mapping = [];

        for (const row of rows) {
            for (const column of columns) {
                if (type.number(row[column])) {
                    const data = {};
                    
                    data[localColumn] = row.id;
                    data[remoteColumn] = row[column];

                    mapping.push(data);
                }

                delete row[column];
            }
        }

        return mapping;
    }




    /**
    * converts thee substance classes to a nested
    * set data structure 
    */
    createOrderedNestedSet(sheetName, parentReference, orderKey) {
        const data = this.data.get(sheetName);


        const getChildren = (parentId) => {
            return data.filter(item => item[parentReference] == parentId);
        };


        const nestify = (items, offset = 1) => {
            items.sort((a, b) => a[orderKey] - b[orderKey]);

            items.forEach((item) => {
                item.left = offset++;
                offset = nestify(getChildren(item.id), offset);
                item.right = offset++;
            });
            
            return offset;
        }


        nestify(getChildren());


        //log(data.map(x => `${x.id}\t${x[parentReference]}\t${x.left}\t${x.right}\t${x.identifier}`));

        // remove parent reference
        data.forEach(item => delete item[parentReference]);

    }






    /**
    * resolve foreign keys to ids, aka emulate 
    * a relational database
    */
    resolveForeignKeys() {
        log.info(`Resolving foreign keys ...`);

        for (const sheetConfig of this.config.sheets) {
            const sheetName = sheetConfig.name;
            const rows = this.data.get(sheetName);

            for (const columnConfig of sheetConfig.columns) {
                if (columnConfig.foreignKey) {
                    const fk = columnConfig.foreignKey;

                    // create a map of the foreign property
                    const foreignData = this.data.get(fk.sheet);
                    const foreignMap = new Map(foreignData.filter(item => !!item[fk.column]).map(item => ([item[fk.column].toLowerCase().trim(), item.id])));

                    // set fk on our rows
                    for (const row of rows) {
                        if (row[columnConfig.name]) {
                            const fkValue = row[columnConfig.name].toLowerCase().trim();

                            if (foreignMap.has(fkValue)) {
                                row[fk.name || `id_${fk.sheet}`] = foreignMap.get(fkValue);
                            } else {
                                log.warn(`Missing foreign entity for '${sheetName}'.'${columnConfig.name}' -> '${fk.sheet}'.'${fk.column}'`);
                            }
                        } else {
                            
                            // no value, remove reference anyway
                            delete row[columnConfig.name];
                        }
                    }
                }
            }
        }


        this.cleanupForeignKeys();
    }







    cleanupForeignKeys() {
        for (const sheetConfig of this.config.sheets) {
            const sheetName = sheetConfig.name;
            const rows = this.data.get(sheetName);

            for (const columnConfig of sheetConfig.columns) {
                if (columnConfig.foreignKey) {

                    // set fk on our rows
                    for (const row of rows) {
                        delete row[columnConfig.name];
                    }
                }
            }
        }
    }







    /**
    * get the structure of the sheet
    */
    loadInfo() {
        return new Promise((resolve, reject) => {

            log.debug(`Getting info for data master ...`);

            this.sheet.getInfo((err, info) => {
                if (err) reject(err);
                else {
                    for (const sheet of info.worksheets) {
                        this.sheets.set(sheet.title.toLowerCase(), sheet);
                    }

                    resolve(info);
                }
            });
        });
    }





    /**
    * get rows for a specifc infect sheet
    */
    getRows(sheetConfig) {
        return new Promise((resolve, reject) => {
            const sheetName = sheetConfig.googleName || sheetConfig.name;
            log.debug(`Getting rows for '${sheetName}' ...`);

            this.sheets.get(sheetName.toLowerCase()).getRows({
                offset: 1,
                limit: 1000,
            }, (err, rows) => {
                if (err) reject(err);
                else {
                    const data = rows.map((row, index) => {
                        const rowData = {
                            id: this.idMappings.translateId(row.id)
                        };

                        for (const column of sheetConfig.columns) {
                            const value = row[column.googleName];

                            if (value === 'TRUE') rowData[column.name] = true;
                            else if (value === 'FALSE') rowData[column.name] = false;
                            else if (value === '') rowData[column.name] = null;
                            else if (! (/[^0-9]/gi.test(value))) rowData[column.name] = parseInt(value, 10);
                            else if (! (/[^0-9\.]/gi.test(value))) rowData[column.name] = parseFloat(value);
                            else rowData[column.name] = value;
                        }


                        if (sheetConfig.translations) {
                            rowData.translations = [];

                            for (const translation of sheetConfig.translations) {
                                const value = row[translation];

                                if (value !== '') {
                                    rowData.translations.push({
                                        language: translation,
                                        value: value,
                                    });
                                }
                            }
                        }

                        return rowData;
                    });

                    resolve(data);
                }
            });
        });
    }







    /**
    * gets an authentication token for the sprreadsheet
    */
    authenticate() {
        return new Promise((resolve, reject) => {
            log.info(`Authenticating ...`);

            this.sheet.useServiceAccountAuth({
                client_email: this.config.googleApiEmail,
                private_key: this.config.googleApiPrivateKey,
            }, (err, token) => {
                if (err) reject(err);
                else resolve(token);
            });
        });
    }
}
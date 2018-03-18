'use strict';


import SpreadSheet from 'google-spreadsheet';
import envr from 'envr';
import path from 'path';
import log from 'ee-log';
import dirname from './dirname';





export default class DataLoader {

    constructor() {

        // load environemnt specific config file
        this.config = envr.config(path.join(dirname.currentDir, '../../config/data-loader/'), path.join(dirname.currentDir, '../../'));

        // set up a spreadsheet instance
        this.sheet = new SpreadSheet(this.config.spreadsheetId);

        // sheet mappings must be retreived from the api
        this.sheets = new Map();
    }







    /**
    * get all data from the data master and store
    * them in the target environemtn storage directory
    */
    async download() {
        await this.authenticate();
        await this.loadInfo();
        
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


        //log(this.data);
    }






    /**
    * converts thee substance classes to a nested
    * set data structure 
    */
    createOrderedNestedSet(sheetName, parentReference, orderKey) {
        const data = this.data.get(sheetName);

        // order by parent, orderKey
        data.sort((a, b) => {
            // not nice, but it works. it's probably too late 
            // to get something nice working. it's a bit wtf!
            return ((a[parentReference] || 0)*1000+a[orderKey]) - ((b[parentReference] || 0)*1000+b[orderKey]);
        });

        
    }






    /**
    * resolve foreign keys to ids, aka emulate 
    * a relational database
    */
    resolveForeignKeys() {
        log.info(`Resolving foreign keys ...`);

        for (const sheetConfig of this.config.sheets) {
            const rows = this.data.get(sheetConfig.name);

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
                                delete row[columnConfig.name];
                            } else {
                                log.warn(`Missing foreign entity for '${sheetConfig.name}'.'${columnConfig.name}' -> '${fk.sheet}'.'${fk.column}'`);
                            }
                        } else {
                            // no value, remove reference anyway
                            delete row[columnConfig.name];
                        }
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
            log.debug(`Getting rows for '${sheetConfig.name}' ...`);

            this.sheets.get(sheetConfig.name.toLowerCase()).getRows({
                offset: 1,
                limit: 1000,
            }, (err, rows) => {
                if (err) reject(err);
                else {
                    const data = rows.map((row, index) => {
                        const rowData = {
                            id: index+1
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
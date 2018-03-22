'use strict';


import fs from 'fs';
import path from 'path';
import util from 'util';
import dirname from './dirname';
import log from 'ee-log';


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);





export default class IDMapping {



    constructor() {
        this.loaded = false;
    }





    async load(env) {
        this.env = env;
        this.filePath = path.join(dirname.currentDir, '../../data/', this.env, '_id_mapping.json');
        let data;

        try {
            const fileData = await readFile(this.filePath);
            data = JSON.parse(fileData);
        } catch (err) {
            log.warn(`Failed to load _id_mapping file from ${this.filePath}: ${err.message}`);
        }
        

        if (data) {
            this.documents = new Map(data.documents.map((document) => {
                const data = {
                    id: document.id,
                    sheets: new Map(document.sheets.map((sheet) => {
                        const data = {
                            id: sheet.id,
                            nextId: sheet.nextId,
                            rows: new Map(sheet.rows.map(row => ([row.googleId, row.id])))
                        };

                        return [sheet.id, data]; 
                    }))
                };

                return [document.id, data];
            }));
        } else {
            this.documents = new Map();
        }
    }





    async save() {
        const data = {
            documents: []
        };


        for (const document of this.documents.values()) {
            const doc = {
                id: document.id,
                sheets: [],
            };

            data.documents.push(doc);


            for (const sheet of document.sheets.values()) {
                const sh = {
                    id: sheet.id,
                    nextId: sheet.nextId,
                    rows: []
                };

                doc.sheets.push(sh);


                for (const [googleId, id] of sheet.rows.entries()) {
                    sh.rows.push({
                        googleId,
                        id,
                    });
                }
            }
        }


        await writeFile(this.filePath, JSON.stringify(data, null, 4));
    }





    /**
    * creates and returns a specific document
    */
    getDocument(documentId) {
        if (!this.documents.has(documentId)) {
            this.documents.set(documentId, {
                id: documentId,
                sheets: new Map(),
            });
        }

        return this.documents.get(documentId);
    }


    /**
    * creates and returns a specific sheet
    */
    getSheet(documentId, sheetId) {
        const document = this.getDocument(documentId);

        if (!document.sheets.has(sheetId)) {
            document.sheets.set(sheetId, {
                id: sheetId,
                nextId: 1,
                rows: new Map(),
            });
        }

        return document.sheets.get(sheetId);
    }


    /**
    * creates and returns a specific row id
    */
    getId(documentId, sheetId, rowId) {
        const sheet = this.getSheet(documentId, sheetId);

        if (!sheet.rows.has(rowId)) {
            sheet.rows.set(rowId, sheet.nextId);
            sheet.nextId++;
        }

        return sheet.rows.get(rowId);
    }



    /**
    * returns a consistent mapping from google 
    * to natural ids
    */
    translateId(googleId) {
        const [x, docId, sheetId, rowId] = /\/([^\/]+)\/([^\/]+)\/([^\/]+)$/gi.exec(googleId);
        return this.getId(docId, sheetId, rowId);
    }
}
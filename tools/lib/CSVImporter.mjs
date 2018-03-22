'use strict';

import csv from 'csv';
import util from 'util';
import fs from 'fs';
import log from 'ee-log';
import path from 'path';
import dirname from './dirname';


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);






export default class CSVImporter {


    constructor() {
        this.config = envr.config(path.join(dirname.currentDir, '../../config/csv-importer/'), path.join(dirname.currentDir, '../../'));
        this.relations = new Map();
    }





    async import() {
        await this.loadRelations();
    }




    async importFile(fileConfig) {
        const filePath = path.join(this.config.sourceDir, fileConfig.fileName+'.csv');
        const data = await readFile(inFile);
        const parsedData = await this.parseCSV(data.toString());

        const rows = parsedData.slice(1).map((row) => ({
            bacteriaName: row[0],
            compoundName: row[1],
            sampleCount: parseInt(row[2], 10),
            resistanceImport: parseInt(row[4], 10),
            confidenceIntervalHigherBound: parseInt(row[6], 10),
            confidenceIntervalLowerBound: parseInt(row[5], 10),
        }));


        rows.forEach((row) => {
            this.resolveRelations(fileConfig, row);
        });
        
    }




    /**
    * normalize the not so normalized data
    */
    resolveRelations(fileConfig, row) {

    }




    /**
    * load data that is used for normalizing the data
    */
    async loadRelations() {
        const relations = ['species', 'bacteria', 'compound', 'region', 'country'];

        for (const relation of relations) {
            const binaryData = await readFile(path.join(this.config.targetDir, relation+'.json'));
            const data = JSON.parse(binaryData);


            if (relation === 'bacteria') {

                // resolve the name via species, bacteria don't have 
                // a name itself
                for (const row of data) {
                    row.identifier = this.relations.get('species').get(row.id_species);
                }
            }

            if (relation === 'species') {
                this.relations.set(relation, new Map(data.map(item => ([item.id, item.identifier]))));
            } else {
                this.relations.set(relation, new Map(data.map(item => ([item.identifier, item.id]))));
            }
        }
    }



    /**
    * parse csv data
    */
    parseCSV(data) {
        return new Promise((resolve, reject) => {
            csv.parse(data, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }
}

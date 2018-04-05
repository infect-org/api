'use strict';

import csv from 'csv';
import util from 'util';
import fs from 'fs';
import log from 'ee-log';
import path from 'path';
import dirname from './dirname';
import envr from 'envr';


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);






export default class CSVImporter {


    constructor() {
        this.config = envr.config(path.join(dirname.currentDir, '../../config/csv-importer/'), path.join(dirname.currentDir, '../../'));
        this.relations = new Map();
        this.rows = [];

         // the data env to use
        this.env = process.argv.includes('--to-dev') ? 'development' : (
            process.argv.includes('--to-beta') ? 'beta' : (
                process.argv.includes('--to-production') ? 'production' : ''
            )
        );

        if (!this.env) throw new Error(`Failed to identify the data env. Please specific it using one of the following flags: --to-dev, --to-beta, --to-production`);
    }





    async import() {
        await this.loadRelations();

        for (const fileConfig of this.config.csvFiles) {
            await this.importFile(fileConfig);
        }

        const filePath = path.join(this.config.targetDir, this.env, 'resistance.json');
        await writeFile(filePath, JSON.stringify(this.rows, null, 4));
        log.success(`Data written to ${filePath}`);
    }




    async importFile(fileConfig) {
        const filePath = path.join(this.config.sourceDir, fileConfig.fileName+'.csv');
        const data = await readFile(filePath);
        const parsedData = await this.parseCSV(data.toString());

        const rows = parsedData.slice(1).map((row) => ({
            bacteriaName: row[0],
            compoundName: row[1],
            sampleCount: parseInt(row[2], 10),
            resistance: parseInt(row[4], 10),
            confidenceIntervalHigherBound: parseInt(row[6], 10),
            confidenceIntervalLowerBound: parseInt(row[5], 10),
        }));


        rows.forEach((row) => {
            this.resolveRelations(fileConfig, row);
            this.rows.push(row);
        });
    }




    /**
    * normalize the not so normalized data
    */
    resolveRelations(fileConfig, row) {
        row.id_country = this.resolveRelation('country', fileConfig.country);
        row.id_region = this.resolveRelation('region', fileConfig.region);
        row.id_bacterium = this.resolveRelation('bacterium', row.bacteriaName);
        row.id_compound = this.resolveRelation('compound', row.compoundName);

        delete row.bacteriaName;
        delete row.compoundName;
    }






    resolveRelation(relation, value) {
        if (!this.relations.has(relation)) throw new Error(`cannot resolve relation ${relation}!`);
        if (!this.relations.get(relation).has(value)) log.warn(`Failed to resolve the value '${value}' for the relation ${relation}`);
        return this.relations.get(relation).get(value);
    }






    /**
    * load data that is used for normalizing the data
    */
    async loadRelations() {
        const relations = ['species', 'bacterium', 'compound', 'region', 'country'];

        for (const relation of relations) {
            const binaryData = await readFile(path.join(this.config.targetDir, this.env, relation+'.json'));
            const data = JSON.parse(binaryData);


            if (relation === 'bacterium') {

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

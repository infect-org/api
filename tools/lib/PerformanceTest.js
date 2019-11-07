'use strict';


import log from 'ee-log';



export default class PerformanceTest {


    constructor({
        sampleCount,
        years = 5,
    }) {
        this.sampleCount = sampleCount;
        this.years = years;
        this.yearsInMS = this.years*365*24*3600*1000;
        this.msPerSample = this.yearsInMS/this.sampleCount;
        this.timeOffset = Date.now()-this.yearsInMS;

        this.samples = new Set();

        this.fields = new Map([
            ['id', index => index],
            ['id_bacteria', index => index % 80],
            ['id_compound', index => index % 80],
            ['age', index => index % 100],
            ['sex', index => index % 3],
            ['resistant', index => index % 3],
            ['id_region', index => index % 10],
            ['sampleTimestamp', index => ((index * this.msPerSample)+this.timeOffset)]
        ]);
    }




    prepare() {
        const start = Date.now();
        log.info(`Generating sample data (${this.sampleCount} samples) ...`);

        for (let i = 0; i < this.sampleCount; i++) {
            if (i % 500000 === 0) log.debug(`sample ${i} ...`);
            const data = {};

            for (const [name, fn] of this.fields.entries()) {
                data[name] = fn(i);
            }

            this.samples.add(data);
        }

        log.info(`Sample data generated after ${Date.now()-start} ms ...`);
    }




    filter(filters) {
        const result = new Set();
        const start = Date.now();
        log.info(`Filtering sample data (${this.sampleCount} samples) ...`);

        sample: for (const sample of this.samples.values()) {
            for (const filter of filters) {
                if (!filter.values.includes(sample[filter.field])) {
                    continue sample;
                }
            }

            result.add(sample);
        }


        log.info(`Sample data filtered after ${Date.now()-start} ms, got ${result.size} samples ...`);
        return result;
    }
}
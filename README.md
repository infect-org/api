# Infect API

### Fetch data from the data master file

    npm run update-production-data
    npm run update-beta-data
    npm run update-data


### Import Resistance Data

    npm run import-production-resistance-data
    npm run import-beta-resistance-data
    npm run import-resistance-data


### Start the API

you may use the following flags to load the data for a specific environment:

- --data-for-dev
- --data-for-beta
- --data-for-production

    node --experimental-modules . --dev --data-for-beta

then go and visit http://l.dns.porn:8000/
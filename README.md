# Infect API

### Fetch data from the data master file

you may use the following flags to store the data for a specific environment:

- --to-dev
- --to-beta
- --to-production

    node --experimental-modules tools/update-from-master.mjs --dev --to-beta


### Start the API

you may use the following flags to load the data for a specific environment:

- --data-for-dev
- --data-for-beta
- --data-for-production

    node --experimental-modules . --dev --data-for-beta

then go and visit http://l.dns.porn:8000/


### API

Currently only the GET endpoints described below are available.

#### Header: Translations

use the `accept-language` header for retrieving translated data. The first matching translation is returned.

    accept-language: de, fr, de-ch;q=0.5, it



#### Header: Select / Includes

You may load related data using the select header. You can only load data through the relations defined on the
entities below.
    
    GET /pathogen.bacteria
    select: *, species.*,  species.genus.*, shape.*, grouping.*

The request above will return something like this:

```json
[
    {
        "id": 4,
        "gramPositive": true,
        "aerobic": true,
        "anaerobic": false,
        "aerobicOptional": false,
        "anaerobicOptional": true,
        "id_species": 4,
        "id_shape": 1,
        "id_grouping": 6,
        "name": "Bacillus cereus",
        "species": {
            "id": 4,
            "identifier": "bacillus cereus",
            "name": "Bacillus cereus",
            "id_genus": 4,
            "genus": {
                "id": 4,
                "identifier": "bacillus",
                "name": "Bacillus"
            }
        },
        "shape": {
            "id": 1,
            "identifier": "bacillus",
            "name": "Rod"
        },
        "grouping": {
            "id": 6,
            "identifier": "single",
            "name": "single"
        }
    }
]
```


## Service Definitions
---
title: Gazetteer

layout: root.html
---

# Gazetteer

The gazetteer object defines which gazetteer should be used for the current locale.

```javascript
"gazetteer": {
  "provider": "MAPBOX",
  "placeholder": "e.g. London",
  "label": true,
  "datasets": [
    {
      "layer": "sprawls",
      "table": "glx_cities_of_the_world",
      "qterm": "name",
      "label": "nameascii",
      "leading_wildcard": true
    }
  ]
}

// "label": true within gazetteer object is optional - it displays result source and is useful in case of searching multiple datasets. 
```

Each dataset supports `"limit"` parameters which defaults to 10. It can be also set within gazetter object in order to apply to all datasets. Results will be sorted alphabetically.

The gazetteer can be set to use either third party provider and / or hosted datasets. Locations from hosted datasets will be selected while geolocations from 3rd party providers are shown as a marker on the map.

`"provider": "MAPBOX"`

The geolocation service to use \(MAPBOX, GOOGLE or OPENCAGE\). A corresponding KEY\_\*\*\* is required in the environment settings in order to use a 3rd party service.

`"placeholder": "e.g. London"`

The placeholder to be shown in the gazetteer input.

It is possible to further restrict the results by defining a bounds entry. The bounds value varies with the gazetteer provider used for the query.

## Google

`"countrycode": "GB"`

The country code to limit the search on 3rd party geolocation services. Permitted country codes are [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).

`"bounds": "location=51.75,-1.25&radius=4000"`

Google requires the bounds to be defined as a latitude, longitude coordinate pair and a radius in metres.

`"components": "country:GB|country:IE"`

Google also accepts "components" parameter (see API Docs) which can pass additional information on expected API response.

In the example above results are restricted to United Kingdom and Republic of Ireland.

## Mapbox

`"bounds": "bbox=-2,50,4,54"`

`"country: "GB"`

## Opencage

`"bounds": "-13,48,5,62"`

`"countrycode": "GB"`

Will require a valid Opencage API key provided as KEY_OPENCAGE in the environment settings.

## Dataset gazetteer

An array of dataset gazetteers which are hit by the autocomplete search first. The 3rd party geolocation service is used once no results are returned from any of the dataset gazetteer entries.

`"layer": "sprawls"`

The layer key in the datasets array object must correspond to a layer defined in the locale's layers.

`"table": "glx_cities_of_the_world"`

The table to be used for the layer. This is required as layers may aggregate data from multiple table.

`"qterm": "name"`

The field to be queried for the search term. Will default to label.

`"label": "nameascii"`

The field which is searched for the autocomplete match. The label is also displayed in the results list.

`"leading_wildcard": true`

The ILIKE query will pre-fix the search term with a wild card. e.g. 'Man' will find 'Central Manchester' as well as 'Manchester Airport'.

`"space_wildcard": true`

If set as true, space_wildcard will break the search term into two.

`"minLength": 2`

The minLength defines the minimum length of the search term before the gazetteer will query connected tables.

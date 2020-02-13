**v2.2.0**

# xyz

**An open source javascript framework for spatial data and application interfaces.**

XYZ is a combination of Node middleware and client libraries for building web applications for the analysis of spatial data.

The XYZ middleware is a collection of RESTful endpoints which provide secure interfaces to spatial data sources.

Spatial data must be stored in a cloud accessible PostGIS (v2.4+) database, allowing XYZ route handler to compose SQL statements that query, transform and aggregate geometries and their associated properties. The use of standards such as [GeoJSON](https://tools.ietf.org/html/rfc7946) and Mapbox Vector Tiles ([MVT](https://docs.mapbox.com/vector-tiles/specification/)) allow for the cartographic presentation of spatial data with common web mapping engines. No additional services such as Geoserver or Mapserver are required.

The XYZ client library makes use of the Openlayers mapping engine and other data view libraries such as Tabulator and Chart.js to build application views for any XYZ Host.

Please visit the XYZ project page at [geolytix.github.io/xyz](https://geolytix.github.io/xyz/) for in depth articles, code samples, documentation and developer notes.

### Application Views

Application views use the XYZ client and a combination of markup, stylesheets, and scripts to wire interface elements to data interfaces in the XYZ middleware.

Views are dashboards which may integrate a range of control elements such as maps, info panels, lists, graphs and tables.

Custom views can be integrated either with the middleware itself or hosted with other ressources in a seperate CDN. We recommend [jsdelivr](https://www.jsdelivr.com/) for access to ressources in Github repositories.

### Environment Settings & Workspaces

Environment settings contain sensitive information such as connection strings for data sources, security information and API keys.

Workspaces define the layers and locations to be loaded by the API and application views.

## Features

### Deployment

XYZ may be deployed to any Node runtime. It is recommended to deploy the Node application as a cloud function to a scalable backend as a service (BaaS).

### Security

Access to the API can be secured with JWT keys, stored in an Access Control List (ACL). Administrative and functional roles can be assigned to registered user accounts. Roles define the level of access to linked data sources. XYZ' security strategy also supports the issue of API keys.

### Editing

User may edit geometries, attributes, and model data in connected PostGIS data sources.

### Data aggregation layer

SQL statements composed in the middleware allow the presentation of aggregated data views from large tables on the client side.

### Dynamic MVT

The XYZ middleware is capable to generate and cache vector tiles in connected PostGIS datasources.

### Proxy for 3rd party services

The XYZ middle may consume 3rd party services from Google Maps, Mapbox, MapTiler, Bing or Here.


## Dependencies

[Openlayers](https://github.com/openlayers/openlayers) - High-performance web mapping engine.

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - A Node implementation of JSON Web Token.

[bcryptjs](https://www.npmjs.com/package/bcryptjs) - Optimized bcrypt in JavaScript with zero dependencies.

[Node-Postgres](https://github.com/brianc/node-postgres) - PostgreSQL client for Node.

[Express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework for Node.

[express-http-proxy](https://www.npmjs.com/package/express-http-proxy) - Express middleware to proxy request to another host and pass response back to original caller.

[hyperHTML](https://github.com/WebReflection/hyperHTML) - A Fast & Light Virtual DOM Alternative.

[chart.js](https://github.com/chartjs/Chart.js) - For the creation of HTML canvas charts in info panels and report views.

[tabulator](https://github.com/olifolkerd/tabulator) - Javascript library for interactive tables and data grids.

[flatpickr](https://www.npmjs.com/package/flatpickr) - A customisable JavaScript datetime picker.

[chroma.js](https://github.com/gka/chroma.js) - A JavaScript library for all kinds of color manipulations.

[TurfJS](https://github.com/Turfjs/turf) - A modular geospatial engine for geometry aggregation and transformations in the middleware and on the client side.

[nodemailer](https://github.com/nodemailer/nodemailer) - Send e-mails with Node – easy as cake!

[node-fetch](https://github.com/bitinn/node-fetch) - A light-weight module that brings window.fetch to Node.

[request](https://www.npmjs.com/package/request) - Request is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.

[mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) - Node device detection from request header.


## License

Free use of the code in this repository is allowed through a [MIT license](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).


## BrowserStack

BrowserStack supports this OpenSource project, providing us with valuable tools to test the XYZ client on different platforms.
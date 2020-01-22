const dbs = require('../pg/dbs')();

const logArray = [];

function log(msg) {
  console.log(msg);
  logArray.push(msg);
}

module.exports = async layers => {

  logArray.length = 0;

  log(' ');
  log('------Checking Layers------');
   
  for (const key of Object.keys(layers)) {

    const layer = layers[key];

    // Check whether the layer connects.
    await chkLayerConnect(layer, layers);

  }

  log('-----------------------------');
  log(' ');

  return logArray;

};

async function chkLayerConnect(layer, layers) {

  if (layer.format === 'cluster') await chkLayerGeom(layer, layers);

  if (layer.format === 'geojson') await chkLayerGeom(layer, layers);

  if (layer.format === 'grid') await chkLayerGeom(layer, layers);

  if (layer.format === 'mvt') await chkLayerGeom(layer, layers);
}

async function chkLayerGeom(layer, layers) {

  let tables = layer.tables ? Object.values(layer.tables) : [layer.table];

  for (const table of tables){

    // Don't invalidate layer with null in tables array.
    if (!table && tables.length > 1) continue;

    // Invalidate layer without table.
    if (!table) return;

    // Invalidate layer if no dbs has been defined.
    if (!layer.dbs || !dbs[layer.dbs]) {
      log(`!!! ${layer.locale}.${layer.key} | ${table}.${layer.geom} (${layer.format}) => Missing or invalid DBS connection`);
      return;
    }

    // Check whether table has layer geom field.
    let rows = await dbs[layer.dbs](`SELECT ${layer.geom} FROM ${table} LIMIT 1`);

    if (rows instanceof Error) {
      log(`!!! ${layer.locale}.${layer.key} | ${table}.${layer.geom} (${layer.format}) => ${rows.err.message}`);
      return;
    }

    log(`${layer.locale}.${layer.key} | ${table}.${layer.geom} (${layer.format}) => 'A-ok'`);

    // Check or create mvt_cache table.
    if (layer.mvt_cache) await chkMVTCache(layer);
  }

}

async function chkMVTCache(layer) {
  
  // Get all MVT tables defined in layer tables.
  let tables = layer.tables ? Object.values(layer.tables) : [layer.table];

  for (const table of tables){

    // Table may be null in tables array.
    if (!table && tables.length > 1) continue;

    // Get a sample MVT from the cache table.
    let rows = await dbs[layer.dbs](`SELECT z, x, y, mvt, tile FROM ${layer.mvt_cache} LIMIT 1`);

    if (rows && rows.err) return await createMVTCache(layer);

    // Check sample MVT.
    if (rows.length > 0) {

      const VectorTile = require('@mapbox/vector-tile').VectorTile;
      const Protobuf = require('pbf');
      const tile = new VectorTile(new Protobuf(rows[0].mvt));

      
      layer.mvt_fields = Object.values(layer.style.themes || {}).map(theme => theme.fieldfx && `${theme.fieldfx} AS ${theme.field}` || theme.field);

     
      // MVT cache without fields.
      if (!layer.mvt_fields.length) return;

      // Check if all mvt_fields are contained in cached MVT.
      for (const field of layer.mvt_fields){

        // Truncate cache table if field is not in sample MVT.
        if (Object.keys(tile.layers).length > 0 && tile.layers[layer.key]._keys.indexOf(field.split(' as ').pop()) < 0) {

          // Truncate the cache table.
          rows = await dbs[layer.dbs](`TRUNCATE ${layer.mvt_cache};`);

          if (rows instanceof Error) {
            return log(`!!! ${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Failed to truncate cache table`);
          }

          return log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Cache table has been truncated`);
        }
      }

      return log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => 'A-ok'`);

    }

    console.log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => 'Huh? Cache table seems to be empty.'`);

  }
  
}

async function createMVTCache(layer){

  let rows = await dbs[layer.dbs](`
    Create UNLOGGED table ${layer.mvt_cache}
    (
      z integer not null,
      x integer not null,
      y integer not null,
      mvt bytea,
      tile geometry(Polygon, ${layer.srid}),
      constraint ${layer.mvt_cache.replace(/\./,'_')}_z_x_y_pk
        primary key (z, x, y)
    );
    
    Create index ${layer.mvt_cache.replace(/\./,'_')}_tile on ${layer.mvt_cache} (tile);`);

  if (rows && rows.err) {
    log(`!!! ${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Failed to create cache table`);
    return delete layer.mvt_cache;
  }

  log(`${layer.locale}.${layer.key} | ${layer.mvt_cache} (mvt cache) => Cache table created`);
}
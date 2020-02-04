const auth = require('../../mod/auth/handler')

const _workspace = require('../../mod/workspace/get')()

const dbs = require('../../mod/pg/dbs')()

const sql_filter = require('../../mod/pg/sql_filter')

module.exports = (req, res) => auth(req, res, handler, {
  public: true
})

async function handler(req, res, token = {}) {

  const workspace = await _workspace

  const locale = workspace.locales[req.query.locale]

  let
    layer = locale.layers[req.query.layer],
    geom = layer.geom,
    style_theme = layer.style.themes[decodeURIComponent(req.query.theme)],
    cat = style_theme && (style_theme.fieldfx || style_theme.field) || null,
    size = style_theme && style_theme.size || 1,
    theme = style_theme && style_theme.type,
    label = req.query.label,
    pixelRatio = parseFloat(req.query.pixelRatio),
    kmeans = parseInt(1 / req.query.kmeans),
    dbscan = parseFloat(req.query.dbscan),
    west = parseFloat(req.query.west),
    south = parseFloat(req.query.south),
    east = parseFloat(req.query.east),
    north = parseFloat(req.query.north)

  // Combine filter with envelope
  const where_sql = `
  WHERE ST_DWithin(
    ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, ${parseInt(layer.srid)}),
    ${geom}, 0.00001)
    ${req.query.filter && await sql_filter(JSON.parse(req.query.filter)) || ''}`

  // Apply KMeans cluster algorithm.
  if (kmeans) {

    var q = `
    SELECT
      count(1)::integer,
      ST_Distance(
        ST_Point(${west}, ${south}),
        ST_Point(${east}, ${north})
      ) AS xdistance
    FROM ${req.query.table} ${where_sql}`

    var rows = await dbs[layer.dbs](q)

    if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

    // return if no locations found within the envelope.
    if (parseInt(rows[0].count) === 0) return res.send([])

    if (kmeans >= rows[0].count) kmeans = rows[0].count


    // KMeans cluster algorithm
    var cluster_sql = `
    (SELECT
      ${cat} AS cat,
      ${size} AS size,
      ${geom} AS geom,
      ${label && label !== 'count' ? label + ' AS label,' : ''}
      ST_ClusterKMeans(${geom}, ${kmeans}
    ) OVER () kmeans_cid
    FROM ${req.query.table} ${where_sql}) kmeans`


    // Apply nested DBScan cluster algorithm.
    if (dbscan) {

      dbscan *= rows[0].xdistance

      cluster_sql = `
      (SELECT
        cat,
        size,
        geom,
        ${label && label !== 'count' ? 'label,' : ''}
        kmeans_cid,
        ST_ClusterDBSCAN(geom, ${dbscan}, 1
      ) OVER (PARTITION BY kmeans_cid) dbscan_cid
      FROM ${cluster_sql}) dbscan`

    }

    if (theme === 'categorized') var cat_sql = `array_agg(cat) cat,`

    if (theme === 'graduated') var cat_sql = `${req.query.aggregate || 'sum'}(cat) cat,`

    var q = `
    SELECT
      count(1) count,
      SUM(size) size,
      ${cat_sql || ''}
      ${label && label !== 'count' ? '(array_agg(label))[1] AS label,' : ''}
      ST_X(ST_PointOnSurface(ST_Union(geom))) AS x,
      ST_Y(ST_PointOnSurface(ST_Union(geom))) AS y
    FROM ${cluster_sql}
    GROUP BY kmeans_cid ${dbscan ? ', dbscan_cid;' : ';'}`


    if (theme === 'competition') var q = `
      SELECT
        SUM(size) count,
        SUM(size) size,
        JSON_Agg(JSON_Build_Object(cat, size)) cat,
        ${label && label !== 'count' ? '(array_agg(label))[1] AS label,' : ''}
        ST_X(ST_PointOnSurface(ST_Union(geom))) AS x,
        ST_Y(ST_PointOnSurface(ST_Union(geom))) AS y
  
      FROM (
        SELECT
          SUM(size) size,
          cat,
          ${label && label !== 'count' ? '(array_agg(label))[1] AS label,' : ''}
          ST_Union(geom) geom,
          kmeans_cid,
          dbscan_cid
  
        FROM ${cluster_sql}
        GROUP BY cat, kmeans_cid ${dbscan ? ', dbscan_cid' : ''}
  
      ) cluster GROUP BY kmeans_cid ${dbscan ? ', dbscan_cid;' : ';'}`

  // Apply grid aggregation if KMeans is not defined.
  } else {

    let r = parseInt(40075016.68 / Math.pow(2, req.query.z) * (layer.cluster_resolution || layer.cluster_hexresolution || 0.1));

    if (layer.cluster_hexresolution) {

      let
        _width = r,
        _height = r - ((r * 2 / Math.sqrt(3)) - r) / 2;

      var with_sql = `
        WITH first as (

          SELECT
            ${cat} AS cat,
            ${size} AS size,
            ${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'} AS geom,
            ST_X(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) x,
            ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) y,

            ((ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_height})::integer % 2) odds,

            CASE WHEN ((ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_height})::integer % 2) = 0 THEN
              ST_Point(
                round(ST_X(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_width}) * ${_width},
                round(ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_height}) * ${_height})

            ELSE ST_Point(
                round(ST_X(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_width}) * ${_width} + ${_width / 2},
                round(ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${_height}) * ${_height})

            END p0                

          FROM ${req.query.table} ${where_sql}

        ), second as (
          
          SELECT
            cat,
            size,

            CASE WHEN odds = 0 THEN CASE
        
              WHEN x < ST_X(p0) THEN CASE
        
                WHEN y < ST_Y(p0) THEN CASE
                  WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
                  ELSE ST_SnapToGrid(p0, 1)
                  END
        
                ELSE CASE
                  WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
                  ELSE ST_SnapToGrid(p0, 1)
                  END
        
                END
        
              ELSE CASE
              
                WHEN y < ST_Y(p0) THEN CASE
                  WHEN (geom <#> ST_Translate(p0, ${_width / 2}, -${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, ${_width / 2}, -${_height}), 1)
                  ELSE ST_SnapToGrid(p0, 1)
                  END
        
                ELSE CASE
                  WHEN (geom <#> ST_Translate(p0, ${_width / 2}, ${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, ${_width / 2}, ${_height}), 1)
                  ELSE ST_SnapToGrid(p0, 1)
                  END
        
                END          
        
              END
              
            ELSE CASE
              WHEN x < (ST_X(p0) - ${_width / 2}) THEN CASE
                WHEN y < ST_Y(p0) THEN CASE
                  WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> ST_Translate(p0, -${_width}, 0)) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
                  ELSE ST_SnapToGrid(ST_Translate(p0, -${_width}, 0), 1)
                  END
        
                ELSE CASE
                  WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> ST_Translate(p0, -${_width}, 0)) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
                  ELSE ST_SnapToGrid(ST_Translate(p0, -${_width}, 0), 1)
                  END
        
                END          
        
              ELSE CASE
                WHEN y < ST_Y(p0) THEN CASE
                  WHEN (geom <#> ST_Translate(p0, -${_width / 2}, -${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, -${_height}), 1)
                  ELSE ST_SnapToGrid(p0, 1)
                  END
        
                ELSE CASE
                  WHEN (geom <#> ST_Translate(p0, -${_width / 2}, ${_height})) < (geom <#> p0) THEN ST_SnapToGrid(ST_Translate(p0, -${_width / 2}, ${_height}), 1)
                  ELSE ST_SnapToGrid(p0, 1)
                  END
        
                END          
        
              END
        
            END as point
          FROM first)`

      var agg_sql = `second GROUP BY point;`

      var xy_sql = `
        ST_X(${layer.srid == 3857 && 'point' || 'ST_Transform(ST_SetSRID(point, 3857), ' + parseInt(layer.srid) + ')'}) x,
        ST_Y(${layer.srid == 3857 && 'point' || 'ST_Transform(ST_SetSRID(point, 3857), ' + parseInt(layer.srid) + ')'}) y`

    } else {

      var agg_sql = `
        (SELECT
          ${cat} AS cat,
          ${size} AS size,
          ST_X(${geom}) AS x,
          ST_Y(${geom}) AS y,
          round(ST_X(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${r}) * ${r} x_round,
          round(ST_Y(${layer.srid == 3857 && geom || 'ST_Transform(' + geom + ', 3857)'}) / ${r}) * ${r} y_round
            
        FROM ${req.query.table} ${where_sql}) agg_sql GROUP BY x_round, y_round;`

      var xy_sql = `
        percentile_disc(0.5) WITHIN GROUP (ORDER BY x) x,
        percentile_disc(0.5) WITHIN GROUP (ORDER BY y) y`
    }

    if (theme === 'categorized') var cat_sql = `array_agg(cat) cat,`

    if (theme === 'graduated') var cat_sql = `${req.query.aggregate || 'sum'}(cat) cat,`

    var q = `
    ${with_sql || ''}
    SELECT
      count(1) count,
      SUM(size) size,
      ${cat_sql || ''}
      ${xy_sql}
    FROM ${agg_sql}`

  }

  var rows = await dbs[layer.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')


  if (!theme) return res.send(rows.map(row => ({
    geometry: {
      x: row.x,
      y: row.y,
    },
    properties: {
      count: parseInt(row.count),
      size: parseInt(row.size),
      label: label === 'count' ? parseInt(row.count) > 1 ? row.count : '' : row.label,
    }
  })))

  if (theme === 'categorized') return res.send(rows.map(row => ({
    geometry: {
      x: row.x,
      y: row.y,
    },
    properties: {
      count: parseInt(row.count),
      size: parseInt(row.size),
      cat: row.cat.length === 1 ? row.cat[0] : null,
      label: row.label,
    }
  })))

  if (theme === 'graduated') return res.send(rows.map(row => ({
    geometry: {
      x: row.x,
      y: row.y,
    },
    properties: {
      count: parseInt(row.count),
      size: parseInt(row.size),
      cat: parseFloat(row.cat),
      label: row.label,
    }
  })))

  if (theme === 'competition') return res.send(rows.map(row => ({
    geometry: {
      x: row.x,
      y: row.y,
    },
    properties: {
      count: parseInt(row.count),
      size: parseInt(row.size),
      cat: Object.assign({}, ...row.cat),
      label: row.label,
    }
  })))

}
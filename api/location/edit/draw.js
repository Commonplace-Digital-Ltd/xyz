const auth = require('../../../mod/auth/handler')

const _workspace = require('../../../mod/workspace/get')()

const dbs = require('../../../mod/pg/dbs')()

module.exports = (req, res) => auth(req, res, handler, {
  public: true
})

async function handler(req, res, token = {}) {

  const workspace = await _workspace

  const locale = workspace.locales[req.query.locale]

  const layer = locale.layers[req.query.layer]

  const geometry = JSON.stringify(req.body.geometry)
  
  const properties = req.body.properties

  var q = `
  INSERT INTO ${req.query.table} (${layer.geom}${properties ? ',' + Object.keys(properties)[0] : ''})
  SELECT
    ST_SetSRID(ST_GeomFromGeoJSON('${geometry}'), ${layer.srid})
    ${properties ? ',\'' + Object.values(properties)[0] + '\'' : ''}
  RETURNING ${layer.qID} AS id;`

  var rows = await dbs[layer.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  if (layer.mvt_cache) {

    var q = `
        DELETE FROM ${layer.mvt_cache} 
        WHERE
          ST_Intersects(
            tile, 
            (SELECT ${layer.geom} FROM ${req.query.table} WHERE ${layer.qID} = $1)
          );`

    await dbs[layer.dbs](q, [rows[0].id])

  }

  res.send(rows[0].id.toString())

}
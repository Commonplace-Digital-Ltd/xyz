const dbs = require('./dbs')()

const sql_filter = require('./layer/sql_filter')

module.exports = async (req, res) => {

  const template = req.params.template

  if (req.params.layer) {

    const locale = req.params.locale && req.params.workspace.locales[req.params.locale]

    const layer = locale && locale.layers[req.params.layer] ||  req.params.workspace.templates[req.params.layer]

    if (!layer) return res.status(400).send('Layer not found.')
  
    req.params.layer = layer

    const roles = layer.roles
      && req.params.user
      && Object.keys(layer.roles)
        .filter(key => req.params.user.roles.includes(key))
        .reduce((obj, key) => {
          obj[key] = layer.roles[key];
          return obj;
        }, {});

    if (!roles && layer.roles) return res.status(403).send('Access prohibited.');

    const filter = `
      ${req.params.filter
        && await sql_filter(Object.entries(JSON.parse(req.params.filter)).map(e => ({[e[0]]:e[1]})))
        || ''}
      ${roles && Object.values(roles).some(r => !!r)
        && await sql_filter(Object.values(roles).filter(r => !!r), 'OR')
        || ''}`

    req.params.viewport = req.params.viewport && req.params.viewport.split(',')
    
    const viewport = req.params.viewport && `
      AND
        ST_Intersects(
          ST_Transform(
            ST_MakeEnvelope(
              ${req.params.viewport[0]},
              ${req.params.viewport[1]},
              ${req.params.viewport[2]},
              ${req.params.viewport[3]},
              ${parseInt(req.params.viewport[4])}
            ),
            ${layer.srid}),
          ${layer.geom}
        )` || ''

    Object.assign(
      req.params,
      {
        layer: layer,
        filter: filter,
        viewport: viewport
      })
  }

  req.params.body = req.body

  try {
    var q = template.render(req.params)
  } catch(err) {
    res.status(500).send(err.message)
    return console.error(err)
  }

  const _dbs = dbs[template.dbs || req.params.dbs || req.params.layer.dbs]

  if (!_dbs) return res.status(500).send(`Cannot connect to ${template.dbs || req.params.dbs || req.params.layer.dbs}`)


  if (req.params.nonblocking || template.nonblocking) {

    _dbs(
      q,
      //[JSON.stringify(req.body)],
      req.body && req.body.length && [JSON.stringify(req.body)] || req.params.params && req.params.params.split(','),
      req.params.statement_timeout || template.statement_timeout)

    return res.send('Non blocking request sent.')

  }

  let body = req.body && Array.isArray(req.body) && [req.body.join(',')]

  body = body || req.body && req.body.length && [JSON.stringify(req.body)]

  body = body || req.params.params && req.params.params.split(',')

  const rows = await _dbs(
    q,
    !template.module && body,
    req.params.statement_timeout || template.statement_timeout)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  const checkEmptyRow = row => typeof row === 'object' && Object.values(row).some(val => val !== null)

  if (rows.length && !rows.some(row => checkEmptyRow(row)) || !checkEmptyRow(rows)) {
    return res.status(202).send('No rows returned from table.')
  }

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)
  
}
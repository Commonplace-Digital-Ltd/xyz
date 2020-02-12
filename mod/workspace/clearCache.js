const fetch = require('node-fetch')

module.exports = async (host, token) => {

  await fetch(`${host}?clear_cache=true&token=${token || ''}`)

  await fetch(`${host}/view/foo?clear_cache=true&token=${token || ''}`)


  await fetch(`${host}/api/gazetteer/autocomplete?clear_cache=true&token=${token || ''}`)


  await fetch(`${host}/api/layer/mvt?clear_cache=true&token=${token || ''}`)

  await fetch(`${host}/api/layer/cluster?clear_cache=true&token=${token || ''}`)

  await fetch(`${host}/api/layer/grid?clear_cache=true&token=${token || ''}`)

  await fetch(`${host}/api/layer/geojson?clear_cache=true&token=${token || ''}`)


  await fetch(`${host}/api/layer/table?clear_cache=true&token=${token || ''}`)

  await fetch(`${host}/api/layer/chart?clear_cache=true&token=${token || ''}`)


  await fetch(`${host}/api/location/list?clear_cache=true&token=${token || ''}`)

  await fetch(`${host}/api/location/pgfunction?clear_cache=true&token=${token || ''}`)

  await fetch(`${host}/api/location/pgquery?clear_cache=true&token=${token || ''}`)

  return

}
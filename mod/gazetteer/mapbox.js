const provider = require('../provider')

module.exports = async (term, gazetteer) => {

  //https://www.mapbox.com/api-documentation/#search-for-places

  // Create url decorated with gazetteer options.
  const results = await provider.mapbox(`api.mapbox.com/geocoding/v5/mapbox.places/${term}.json?`
    + `${gazetteer.code ? 'country=' + gazetteer.code : ''}`
    + `${gazetteer.bounds ? '&' + gazetteer.bounds : ''}`
    + '&types=postcode,district,locality,place,neighborhood,address,poi')

  // Return results to route. Zero results will return an empty array.
  return results.features.map(f => ({
    label: `${f.text} (${f.place_type[0]}) ${!gazetteer.code && f.context ? ', ' + f.context.slice(-1)[0].text : ''}`,
    id: f.id,
    marker: f.center,
    source: 'mapbox'
  }))

}
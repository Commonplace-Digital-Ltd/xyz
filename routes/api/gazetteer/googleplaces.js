module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/gazetteer/googleplaces',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: global.public
      })
    ]),
    handler: async (req, res) => {

      const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.query.id}&${global.KEYS.GOOGLE}`;

      const fetched = await require(global.appRoot + '/mod/fetch')(url);

      if (fetched._err) res.code(500).send(fetched._err);

      res.code(200).send({
        type: 'Point',
        coordinates: [fetched.result.geometry.location.lng, fetched.result.geometry.location.lat]
      });

    }
  });
};
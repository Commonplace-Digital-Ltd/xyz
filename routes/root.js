const env = require('../mod/env');

// Create constructor for mobile detect module.
const Md = require('mobile-detect');

const template = require('backtick-template');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');

const fetch = require('node-fetch');

module.exports = { route, view };

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true,
        login: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/',
    handler: (req, res) => fastify.login.post(req, res, {
      view: view
    })
  });

};

async function view(req, res, token = { access: 'public' }) {

  // Check whether request comes from a mobile platform and set template.
  const md = new Md(req.headers['user-agent']);

  const tmpl = (md.mobile() === null || md.tablet() !== null) ?
    await fetch(`${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${env.path}/views/desktop.html`) :
    await fetch(`${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${env.path}/views/mobile.html`);

  const html = template(await tmpl.text(), {
    dir: env.path,
    title: env.workspace.title || 'GEOLYTIX | XYZ',
    nanoid: nanoid(6),
    token: req.query.token || token.signed || '""',
    log: env.logs || '""',
    login: (env.acl_connection) && 'true' || '""',
    pgworkspace: (env.pg.workspace) && 'true' || '""',
  });

  //Build the template with jsrender and send to client.
  res.type('text/html').send(html);

};
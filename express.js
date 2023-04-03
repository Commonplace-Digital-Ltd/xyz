const dotenv = require('dotenv');
const compression = require('compression')

dotenv.config();

const express = require('express');

const cookieParser = require('cookie-parser');

const cors = require('cors');

const app = express();

app.use(process.env.DIR || '', compression(), express.static('public'));

app.use(`/xyz/docs`, express.static('docs'));

app.use(cookieParser());
app.use(cors());

//
// Requires 3 secrets in SecretsManager
//   production/xyz/mongodb
//   preprod/xyz/mongodb
//   staging/xyz/mongodb
// each with username and password (not url)
//
const {SecretsManager} = require("aws-sdk");
const mongoConnection = async () => {
  let secretClient = new SecretsManager({ region: process.env.AWS_DEFAULT_REGION });
  let secretId = `${process.env.XYZ_ENV}/xyz/mongodb`;
  const mongoDbSecret = await secretClient.getSecretValue({SecretId: secretId}).promise().then((data) => {
    return JSON.parse(data.SecretString);
  })

  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
      username: mongoDbSecret["username"],
      password: mongoDbSecret["password"],
    },
  };

  const { MongoClient } = require('mongodb');
  const mongoClient = new MongoClient(process.env.MONGODB_URL, mongoOptions);
  await mongoClient.connect();
  return mongoClient;
};

const _api = require('./api/api');

mongoConnection().then(async (db) => {
  const api = (req, res) => {
    req.mongoClient = db;
    return _api(req, res);
  };

  let dir = process.env.DIR;
  app.get(`${dir}/api/proxy`, api);

  app.get(`${dir}/api/provider/:provider?`, api);

  app.post(
    `${dir}/api/provider/:provider?`,
    express.json({ limit: '5mb' }),
    api
  );

  app.get(`${dir}/api/query/:template?`, api);

  app.post(
    `${dir}/api/query/:template?`,
    express.json({ limit: '5mb' }),
    api
  );

  app.get(`${dir}/api/gazetteer`, api);

  app.get(`${dir}/api/workspace/get/:key?`, api);

  app.get(`${dir}/api/layer/:format?/:z?/:x?/:y?`, api);

  app.get(`${dir}/api/location/:method?`, api);

  app.post(
    `${dir}/api/location/:method?`,
    express.json({ limit: '5mb' }),
    api
  );

  app.get(`${dir}/api/user/:method?/:key?`, api);

  app.post(
    `${dir}/api/user/:method?/:key?`,
    express.urlencoded({ extended: true }),
    api
  );

  //sudo ./caddy_linux_amd64 reverse-proxy --from localhost:443 --to localhost:3000
  app.get(`${dir}/auth0/logout`, api);

  app.get(`${dir}/auth0/login`, api);

  app.get(`${dir}/auth0/callback`, api);

  app.get(`${dir}/saml/metadata`, api);

  app.get(`${dir}/saml/logout`, api);

  app.get(`${dir}/saml/login`, api);

  app.post(
    `${dir}/saml/acs`,
    express.urlencoded({ extended: true }),
    api
  );

  //sudo ./caddy_linux_amd64 reverse-proxy --from localhost:443 --to localhost:3000
  app.get(`${dir}/saml/metadata`, api)
  app.get(`${dir}/view/:template?`, api);

  app.get(`${dir}/`, api);

  app.get(`${dir}/ping`, (req, res) =>
    res.json({ works: true })
  );

  dir && app.get(`/`, api);

  app.listen(process.env.PORT);
});

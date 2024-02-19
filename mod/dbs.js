const { Pool } = require('pg');
const { SecretsManager } = require('@aws-sdk/client-secrets-manager');

const dbs = {};

// Needs a DBS_XYZ envvar with the connection string
// without the username/password information
module.exports = () => {
  Object.keys(process.env)
    .filter((key) => key.split('_')[0] === 'DBS')
    .filter((key) => !dbs[key.split('_')[1]])
    .forEach(async (key) => {
      if (process.env[key].match(/rds|localhost/))
        return await postgres(key.split('_')[1], process.env[key]);

      if (process.env[key].match(/^aurora/))
        return aurora(key.split('_')[1], process.env[key]);
    });

  async function postgres(key, host) {
    const secretClient = new SecretsManager({ region: process.env.AWS_DEFAULT_REGION });
    const secretId = `${process.env.XYZ_ENV}/xyz/pg`;
    const pgSecret = await secretClient.getSecretValue({ SecretId: secretId }).then((data) => {
      return JSON.parse(data.SecretString);
    })

    // Create connection pool.
    console.log('Creating postgres connection pool...')
    const pool = new Pool({
      database: 'map',
      user: pgSecret['username'],
      password: pgSecret['password'],
      host,
      port: 5432,
      statement_timeout: parseInt(process.env.STATEMENT_TIMEOUT) || 10000,
      max: 50,
      idleTimeoutMillis: 30000,
    });

    dbs[key] = async (q, arr, timeout) => {
      // Request which accepts q and arr and will return rows or rows.err.
      try {
        timeout && (await pool.query(`SET statement_timeout = ${timeout}`));

        const { rows } = await pool.query(q, arr);

        timeout && (await pool.query(`SET statement_timeout = 10000`));

        return rows;
      } catch (err) {
        console.error(err);
        return err;
      }
    };
  }


  function aurora(key, connectionString) {
    const keyValueArr = connectionString.split('|');

    const apiclient = require('data-api-client')({
      engine: 'pg',
      options: {
        accessKeyId: keyValueArr[1],
        secretAccessKey: keyValueArr[2],
        region: keyValueArr[3],
      },
      resourceArn: keyValueArr[4],
      secretArn: keyValueArr[5],
      database: keyValueArr[6],
    });

    dbs[key] = async (q) => {
      // Request which accepts q and arr and will return rows or rows.err.
      try {
        const { records } = await apiclient.query(q);

        return records;
      } catch (err) {
        console.error(err);
        return err;
      }
    };
  }

  return dbs;
};

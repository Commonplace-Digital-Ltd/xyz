const fetch = require('node-fetch');

const template = require('backtick-template');

module.exports = async (req, res, msg) => {

  const tmpl = await fetch(`${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${process.env.DIR || ''}/views/login.html`)

  const html = template(await tmpl.text(), {
    dir: process.env.DIR || '',
    action: req.url && decodeURIComponent(req.url),
    msg: msg || ' ',
    captcha: process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[0] || '',
  });

  res.send(html);
}
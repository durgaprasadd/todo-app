const fs = require('fs');
const { FILES, MIME_TYPES } = require('./constants.js');

const logRequest = function(req, res, next) {
  console.log('url =>', req.url);
  console.log('cookie =>', req.cookie);
  console.log('<---------------------------------------->');
  next();
};

const readBody = function(req, res, next) {
  let text = '';
  req.on('data', chunk => (text += chunk));
  req.on('end', () => {
    req.body = text;
    next();
  });
};

const readCookie = function(req, res, next) {
  let cookie = req.headers.cookie;
  req.cookie = cookie;
  if (!cookie) {
    res.setHeader('set-cookie', `userName=`);
    req.cookie = `userName=`;
  }
  next();
};

const readUsername = function(req, res, next) {
  const cookie = req.cookie;
  const username = cookie.split('=')[1];
  req.username = username;
  next();
};

const send = function(res, data, contentType, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader('content-type', contentType);
  res.write(data);
  res.end();
};

const sendNotFound = function(res) {
  send(res, 'Not found', 'text/plain', 404);
};

module.exports = {
  logRequest,
  readBody,
  readCookie,
  send,
  sendNotFound,
  readUsername
};

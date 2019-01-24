const Sheegra = require('./sheegra');
const app = new Sheegra();
const fs = require('fs');
const TodoLists = require('./model.js');
const userLists = fs.readFileSync('./private/userList.json');
const todoLists = new TodoLists(JSON.parse(userLists));

const logRequest = function(req, res, next) {
  console.log('url =>', req.url);
  console.log('method =>', req.method);
  console.log('headers =>', req.headers);
  console.log('body =>', req.body);
  console.log(todoLists);
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

const send = function(res, data, statusCode = 200) {
  res.statusCode = statusCode;
  res.write(data);
  res.end();
};

const sendNotFound = function(res) {
  res.statusCode = 404;
  res.end();
};

const getPath = function(req) {
  const root = './public';
  let path = req.url;
  if (req.url == '/') {
    path = '/homePage.html';
  }
  return root + path;
};

const reader = function(req, res) {
  const path = getPath(req);
  fs.readFile(path, (err, data) => {
    if (err) {
      sendNotFound(res);
      return;
    }
    send(res, data);
  });
};

const addList = function(req, res) {
  let { title, id } = JSON.parse(req.body);
  todoLists.addList(title, id);
  fs.writeFile(
    './private/userList.json',
    todoLists.getStringifiedLists(),
    () => {}
  );
  res.end();
};

const getTodoLists = function(req, res) {
  send(res, todoLists.getStringifiedLists());
};

app.use(readBody);
app.use(logRequest);
app.post('/addList', addList);
app.get('/getTodoLists', getTodoLists);
app.use(reader);
module.exports = app.handleRequest.bind(app);

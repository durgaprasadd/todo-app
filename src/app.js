const Sheegra = require('./sheegra');
const app = new Sheegra();
const fs = require('fs');
const { Todos, LoggedInUsers } = require('./model.js');
const Users = require('./users.js');
const { FILES, MIME_TYPES } = require('./constants.js');
const loggedInUsers = new LoggedInUsers();

const initializePrivateDir = function() {
  fs.mkdirSync('./private');
  fs.mkdirSync('./private/TODOs');
  fs.writeFileSync(FILES.usersFile, '[]');
};

const getUsers = function() {
  if (!fs.existsSync('./private')) {
    initializePrivateDir();
  }
  const storedUsers = fs.readFileSync(FILES.usersFile);
  return JSON.parse(storedUsers);
};
const users = new Users(getUsers());

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

const setCookie = function(res, userName) {
  res.setHeader('set-cookie', `userName=${userName}`);
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

const getPath = function(url) {
  const root = './public';
  let path = url;
  if (url == '/') {
    path = FILES.homePage;
  }
  return root + path;
};

const reader = function(req, res) {
  const path = getPath(req.url);
  const extension = path.split('.').pop();

  fs.readFile(path, (err, data) => {
    if (err) {
      sendNotFound(res);
      return;
    }
    send(res, data, MIME_TYPES[extension]);
  });
};

const getUserTODOs = function(userName) {
  return loggedInUsers.getTODOs(userName);
};

const writeIntoTodo = function(userName) {
  fs.writeFile(
    FILES.TODO_DIR + userName,
    getUserTODOs(userName).getStringifiedTodos(),
    () => {}
  );
};

const addList = function(req, res) {
  let { title, description, id } = JSON.parse(req.body);
  let userName = getUserName(req.cookie);
  getUserTODOs(userName).addTodo(title, id, description);
  writeIntoTodo(userName);
  res.end();
};

const getTodoLists = function(req, res) {
  let userName = getUserName(req.cookie);
  send(res, getUserTODOs(userName).getStringifiedTodos(), MIME_TYPES.js);
};

const addUser = function(user) {
  users.addUser(user);
  fs.writeFile(FILES.usersFile, users.getStringifiedUsers(), err => {});
};

const createUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (users.doesUserExist(user.userName)) {
    send(res, 'alreadyExists', MIME_TYPES.plain);
    return;
  }
  addUser(user);
  fs.writeFile(FILES.TODO_DIR + user.userName, '[]', () => {});
  send(res, 'successful', MIME_TYPES.plain);
};

const validateUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (!users.doesUserExist(user.userName)) {
    send(res, 'notExist', MIME_TYPES.plain);
    return;
  }
  if (!users.isValidUser(user)) {
    send(res, 'incorrectPassword', MIME_TYPES.plain);
    return;
  }
  setCookie(res, user.userName);
  send(res, 'success', MIME_TYPES.plain);
};

const getUserName = function(text) {
  return text.split('=')[1];
};

const serveDashboard = function(req, res) {
  let userName = getUserName(req.cookie);
  const path = FILES.TODO_DIR + userName;
  fs.readFile(path, (err, data) => {
    if (!err) {
      const todos = new Todos();
      todos.parse(JSON.parse(data));
      loggedInUsers.addUser(userName, todos);
      req.url = FILES.dashboard;
      reader(req, res);
      return;
    }
    sendNotFound(res);
  });
};

const logout = function(req, res) {
  res.setHeader('set-cookie', `userName=`);
  res.writeHead(302, { Location: '/' });
  res.end();
};

const checkUserLogin = function(req, res) {
  console.log('hello');
  let userName = getUserName(req.cookie);
  if (!userName) {
    reader(req, res);
    return;
  }
  res.statusCode = 302;
  res.setHeader('location', '/dashboard');
  res.end();
};

const addTitleAndDescription = function(res, data, TODO) {
  let content = data.replace('#title#', TODO.title);
  content = content.replace('#description#', TODO.description || '');
  send(res, content, MIME_TYPES.html);
};

const serveTodo = function(res, TODO, next) {
  fs.readFile(FILES.TODO, 'utf8', (err, data) => {
    if (err || !TODO) return next();
    addTitleAndDescription(res, data, TODO);
  });
};

const getTodoItems = function(req, res, next) {
  const id = req.url.slice(1);
  const userName = getUserName(req.cookie);
  const TODOs = getUserTODOs(userName);
  if (!TODOs) return next();
  const TODO = TODOs.getTodo(id);
  serveTodo(res, TODO, next);
};

const submitItem = function(req, res) {
  const userName = getUserName(req.cookie);
  const { value, listId, id } = JSON.parse(req.body);
  const TODO = getUserTODOs(userName).getTodo(listId);
  TODO.addItem(value, id);
  writeIntoTodo(userName);
};

const changeStatus = function(req, res) {
  const userName = getUserName(req.cookie);
  const { id, listId } = JSON.parse(req.body);
  const TODO = getUserTODOs(userName).getTodo(listId);
  const item = TODO.getItem(id);
  item.toggleStatus();
  writeIntoTodo(userName);
  res.end();
};

const getInitialTodoItems = function(req, res) {
  const id = req.body;
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getTodo(id);
  send(res, JSON.stringify(TODO.items), MIME_TYPES.json);
};

const deleteList = function(req, res) {
  const id = req.body;
  const userName = getUserName(req.cookie);
  getUserTODOs(userName).deleteTodo(id);
  writeIntoTodo(userName);
  res.end();
};

const deleteItem = function(req, res) {
  const { listId, id } = JSON.parse(req.body);
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getTodo(listId);
  TODO.deleteItem(id);
  writeIntoTodo(userName);
  res.end();
};

const editListHandler = function(req, res) {
  const { newTitle, newDescription, id } = JSON.parse(req.body);
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getTodo(id);
  TODO.editTodo(newTitle, newDescription);
  writeIntoTodo(userName);
  res.end();
};

const editItemHandler = function(req, res) {
  const { listId, newDescription, id } = JSON.parse(req.body);
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getTodo(listId);
  const item = TODO.getItem(id);
  item.editDescription(newDescription);
  writeIntoTodo(userName);
  res.end();
};

app.use(readCookie);
app.use(readBody);
app.use(logRequest);
app.use(getTodoItems);
app.post('/addList', addList);
app.get('/getTodoLists', getTodoLists);
app.post('/createUser', createUser);
app.post('/validateUser', validateUser);
app.post('/submitItem', submitItem);
app.post('/changeStatus', changeStatus);
app.get('/dashboard', serveDashboard);
app.get('/logout', logout);
app.post('/getInitialTodoItems', getInitialTodoItems);
app.post('/deleteList', deleteList);
app.post('/deleteItem', deleteItem);
app.post('/editList', editListHandler);
app.post('/editItem', editItemHandler);
app.get('/', checkUserLogin);
app.use(reader);

module.exports = app.handleRequest.bind(app);

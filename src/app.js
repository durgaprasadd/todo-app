const express = require('express');
const fs = require('fs');
const { FILES, MIME_TYPES } = require('./constants.js');
const {
  logRequest,
  readBody,
  readCookie,
  send,
  sendNotFound,
  readUsername
} = require('./handlers.js');
const view = require('pug');
const { Todos, Todo, Item, LoggedInUsers } = require('./model.js');
const app = express();
const loggedInUsers = new LoggedInUsers();
const setCookie = function(res, userName) {
  res.setHeader('set-cookie', `userName=${userName}`);
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

const addTodo = function(req, res) {
  const { title, description, id } = JSON.parse(req.body);
  const todo = new Todo(title, id, description);
  const username = req.username;
  getUserTODOs(username).addTodo(todo);
  writeIntoTodo(username);
  res.end();
};

const getTodoLists = function(req, res) {
  const username = req.username;
  send(res, getUserTODOs(username).getStringifiedTodos(), MIME_TYPES.js);
};

const addUser = function(users, user) {
  users.addUser(user);
  fs.writeFile(FILES.usersFile, users.getStringifiedUsers(), err => {});
};

const createUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (res.app.users.doesUserExist(user.userName)) {
    send(res, 'alreadyExists', MIME_TYPES.plain);
    return;
  }
  addUser(res.app.users, user);
  fs.writeFile(FILES.TODO_DIR + user.userName, '[]', () => {});
  send(res, 'successful', MIME_TYPES.plain);
};

const readUserTodos = function(username) {
  const path = FILES.TODO_DIR + username;
  fs.readFile(path, (err, stringifiedTodos) => {
    if (!err) {
      const todos = new Todos();
      todos.parse(JSON.parse(stringifiedTodos));
      loggedInUsers.addUser(username, todos);
    }
  });
};

const login = function(res, username) {
  setCookie(res, username);
  readUserTodos(username);
  send(res, 'success', MIME_TYPES.plain);
};

const validateUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (!res.app.users.doesUserExist(user.userName)) {
    send(res, 'notExist', MIME_TYPES.plain);
    return;
  }
  if (!res.app.users.isValidUser(user)) {
    send(res, 'incorrectPassword', MIME_TYPES.plain);
    return;
  }
  login(res, user.userName);
};

const serveDashboard = function(req, res) {
  res.render('dashboard', function(err, template) {
    if (err) {
      console.log(res.statusCode);
    }
    const dashboard = template.replace('#username#', req.username);
    res.send(dashboard);
  });
};

const logout = function(req, res) {
  res.setHeader('set-cookie', `userName=`);
  res.writeHead(302, { Location: '/' });
  res.end();
};

const serveHomepage = function(res) {
  res.render('homePage');
};

const checkUserLogin = function(req, res) {
  const username = req.username;
  if (!username) {
    serveHomepage(res);
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
  const username = req.username;
  const TODOs = getUserTODOs(username);
  if (!TODOs) return next();
  const TODO = TODOs.getTodo(id);
  serveTodo(res, TODO, next);
};

const submitItem = function(req, res) {
  const username = req.username;
  const { value, todoId, id } = JSON.parse(req.body);
  const TODO = getUserTODOs(username).getTodo(todoId);
  const item = new Item(value, id);
  TODO.addItem(item);
  writeIntoTodo(username);
};

const changeStatus = function(req, res) {
  const username = req.username;
  const { id, todoId } = JSON.parse(req.body);
  const TODO = getUserTODOs(username).getTodo(todoId);
  const item = TODO.getItem(id);
  item.toggleStatus();
  writeIntoTodo(username);
  res.end();
};

const getInitialTodoItems = function(req, res) {
  const id = req.body;
  const username = req.username;
  const TODO = getUserTODOs(username).getTodo(id);
  send(res, JSON.stringify(TODO.items), MIME_TYPES.json);
};

const deleteList = function(req, res) {
  const id = req.body;
  const username = req.username;
  getUserTODOs(username).deleteTodo(id);
  writeIntoTodo(username);
  res.end();
};

const deleteItem = function(req, res) {
  const { todoId, id } = JSON.parse(req.body);
  const username = req.username;
  const TODO = getUserTODOs(username).getTodo(todoId);
  TODO.deleteItem(id);
  writeIntoTodo(username);
  res.end();
};

const editListHandler = function(req, res) {
  const { newTitle, newDescription, id } = JSON.parse(req.body);
  const username = req.username;
  const TODO = getUserTODOs(username).getTodo(id);
  TODO.editTodo(newTitle, newDescription);
  writeIntoTodo(username);
  res.end();
};

const editItemHandler = function(req, res) {
  const { todoId, newDescription, id } = JSON.parse(req.body);
  const username = req.username;
  const TODO = getUserTODOs(username).getTodo(todoId);
  const item = TODO.getItem(id);
  item.editDescription(newDescription);
  writeIntoTodo(username);
  res.end();
};

app.set(
  'views',
  '/Users/aftabshk/html/playingWithHTML/playingWithServer/todo-app/public'
);
app.engine('html', view.__express);
app.set('view engine', 'html');

app.use(readCookie);
app.use(readBody);
app.use(logRequest);
app.use(readUsername);
app.use(getTodoItems);
app.post('/addList', addTodo);
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
app.use(express.static('public'));

module.exports = app;

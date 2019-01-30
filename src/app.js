const Sheegra = require('./sheegra');
const app = new Sheegra();
const fs = require('fs');
const TodoLists = require('./model.js');
const Users = require('./users.js');
let todoLists = '';

const getUsers = function() {
  const storedUsers = fs.readFileSync('./private/users.json');
  return JSON.parse(storedUsers);
};
const users = new Users(getUsers());

const logRequest = function(req, res, next) {
  console.log('url =>', req.url);
  //   console.log('method =>', req.method);
  //   console.log('headers =>', req.headers);
  //   console.log('body =>', req.body);
  //   console.log(todoLists);
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

const writeIntoFile = function(req) {
  fs.writeFile(
    `./private/todoLists/${getUserName(req.cookie)}`,
    todoLists.getStringifiedLists(),
    () => {}
  );
};

const addList = function(req, res) {
  console.log(todoLists);
  let { title, description, id } = JSON.parse(req.body);
  todoLists.addList(title, id, description);
  writeIntoFile(req);
  res.end();
};

const getTodoLists = function(req, res) {
  send(res, todoLists.getStringifiedLists());
};

const addUser = function(user) {
  users.addUser(user);
  fs.writeFile('./private/users.json', users.getStringifiedUsers(), err => {});
};

const createUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (users.doesUserExist(user.userName)) {
    send(res, 'alreadyExists');
    return;
  }
  addUser(user);
  fs.writeFile(`./private/todoLists/${user.userName}`, '[]', () => {});
  send(res, 'successful');
};

const validateUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (!users.doesUserExist(user.userName)) {
    send(res, 'notExist');
    return;
  }
  if (!users.isValidUser(user)) {
    send(res, 'incorrectPassword');
    return;
  }
  setCookie(res, user.userName);
  send(res, 'success');
};

const getUserName = function(text) {
  return text.split('=')[1];
};

const serveDashboard = function(req, res) {
  let userName = getUserName(req.cookie);
  const path = `./private/todoLists/${userName}`;
  fs.readFile(path, (err, data) => {
    if (!err) {
      todoLists = new TodoLists();
      todoLists.createObjects(JSON.parse(data));
      req.url = '/TODO.html';
      reader(req, res);
      return;
    }
    sendNotFound(res);
  });
};

const logout = function(req, res) {
  res.setHeader('set-cookie', `userName=`);
  res.end();
};

const checkUserLogin = function(req, res) {
  let userName = getUserName(req.cookie);
  if (!userName) {
    reader(req, res);
    return;
  }
  res.statusCode = 302;
  res.setHeader('location', '/dashboard');
  res.end();
  // serveDashboard(req, res);
};

const getTodoItems = function(req, res, next) {
  const id = req.url.slice(1);
  console.log(todoLists);
  if (id && isFinite(id)) {
    const TODO = todoLists.getList(id);
    fs.readFile('./public/List.html', 'utf8', (err, data) => {
      if (!err) {
        let content = data.replace('#title#', TODO.listName);
        content = content.replace('#description#', TODO.description || '');
        send(res, content);
        return;
      }
    });
  } else {
    next();
  }
};

const submitItem = function(req, res) {
  const { value, listId, id } = JSON.parse(req.body);
  const TODO = todoLists.getList(listId);
  TODO.addItem(value, id);
  writeIntoFile(req);
};

const changeStatus = function(req, res) {
  const { id, listId } = JSON.parse(req.body);
  const todo = todoLists.getList(listId);
  const item = todo.getItem(id);
  item.toggleStatus();
  writeIntoFile(req);
  res.end();
};

const getInitialTodoItems = function(req, res) {
  const id = req.body;
  const todo = todoLists.getList(id);
  send(res, JSON.stringify(todo.items));
};

const deleteList = function(req, res) {
  const id = req.body;
  todoLists.deleteList(id);
  writeIntoFile(req);
  res.end();
};

const deleteItem = function(req, res) {
  const { listId, id } = JSON.parse(req.body);
  const TODO = todoLists.getList(listId);
  TODO.deleteItem(id);
  writeIntoFile(req);
  res.end();
};

const editListHandler = function(req, res) {
  const { newTitle, newDescription, id } = JSON.parse(req.body);
  const TODO = todoLists.getList(id);
  TODO.editList(newTitle, newDescription);
  writeIntoFile(req);
  res.end();
};

const editItemHandler = function(req, res) {
  const { listId, newDescription, id } = JSON.parse(req.body);
  const TODO = todoLists.getList(listId);
  const item = TODO.getItem(id);
  item.editDescription(newDescription);
  writeIntoFile(req);
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

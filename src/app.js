const Sheegra = require('./sheegra');
const app = new Sheegra();
const fs = require('fs');
const { TodoLists, LoggedInUsers } = require('./model.js');
const Users = require('./users.js');
let loggedInUsers = new LoggedInUsers();

const getUsers = function() {
  const storedUsers = fs.readFileSync('./private/users.json');
  return JSON.parse(storedUsers);
};
const users = new Users(getUsers());

const logRequest = function(req, res, next) {
  console.log('url =>', req.url);
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
  const extension = path.split('.').pop();
  const MIMETypes = {
    css: 'text/css',
    html: 'text/html',
    js: 'text/javascript',
    png: 'image/png'
  };
  fs.readFile(path, (err, data) => {
    if (err) {
      sendNotFound(res);
      return;
    }
    send(res, data, MIMETypes[extension]);
  });
};

const getUserTODOs = function(userName) {
  return loggedInUsers.getTODOs(userName);
}

const writeIntoFile = function(userName) {
  fs.writeFile(
    `./private/todoLists/${userName}`,
    getUserTODOs(userName).getStringifiedLists(),
    () => {}
  );
};

const addList = function(req, res) {
  let { title, description, id } = JSON.parse(req.body);
  let userName = getUserName(req.cookie);
  getUserTODOs(userName).addList(title, id, description);
  writeIntoFile(userName);
  res.end();
};

const getTodoLists = function(req, res) {
  let userName = getUserName(req.cookie);
  send(res, getUserTODOs(userName).getStringifiedLists(), 'text/javascript');
};

const addUser = function(user) {
  users.addUser(user);
  fs.writeFile('./private/users.json', users.getStringifiedUsers(), err => {});
};

const createUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (users.doesUserExist(user.userName)) {
    send(res, 'alreadyExists', 'text/plain');
    return;
  }
  addUser(user);
  fs.writeFile(`./private/todoLists/${user.userName}`, '[]', () => {});
  send(res, 'successful','text/plain');
};

const validateUser = function(req, res) {
  const user = JSON.parse(req.body);
  if (!users.doesUserExist(user.userName)) {
    send(res, 'notExist','text/plain');
    return;
  }
  if (!users.isValidUser(user)) {
    send(res, 'incorrectPassword','text/plain');
    return;
  }
  setCookie(res, user.userName);
  send(res, 'success','text/plain');
};

const getUserName = function(text) {
  return text.split('=')[1];
};

const serveDashboard = function(req, res) {
  let userName = getUserName(req.cookie);
  const path = `./private/todoLists/${userName}`;
  fs.readFile(path, (err, data) => {
    if (!err) {
      const todoLists = new TodoLists();
      todoLists.createObjects(JSON.parse(data));
      loggedInUsers.addUser(userName, todoLists);
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
};

const getTodoItems = function(req, res, next) {
  const id = req.url.slice(1);
  const userName = getUserName(req.cookie);
  if (id && isFinite(id)) {
    const TODO = getUserTODOs(userName).getList(id);
    fs.readFile('./public/List.html', 'utf8', (err, data) => {
      if (!err) {
        let content = data.replace('#title#', TODO.listName);
        content = content.replace('#description#', TODO.description || '');
        send(res, content,'text/html');
        return;
      }
    });
  } else {
    next();
  }
};

const submitItem = function(req, res) {
  const userName = getUserName(req.cookie);
  const { value, listId, id } = JSON.parse(req.body);
  const TODO = getUserTODOs(userName).getList(listId);
  TODO.addItem(value, id);
  writeIntoFile(userName);
};

const changeStatus = function(req, res) {
  const userName = getUserName(req.cookie);
  const { id, listId } = JSON.parse(req.body);
  const TODO = getUserTODOs(userName).getList(listId);
  const item = TODO.getItem(id);
  item.toggleStatus();
  writeIntoFile(userName);
  res.end();
};

const getInitialTodoItems = function(req, res) {
  const id = req.body;
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getList(id);
  send(res, JSON.stringify(TODO.items), 'application/json');
};

const deleteList = function(req, res) {
  const id = req.body;
  const userName = getUserName(req.cookie);
  getUserTODOs(userName).deleteList(id);
  writeIntoFile(userName);
  res.end();
};

const deleteItem = function(req, res) {
  const { listId, id } = JSON.parse(req.body);
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getList(listId);
  TODO.deleteItem(id);
  writeIntoFile(userName);
  res.end();
};

const editListHandler = function(req, res) {
  const { newTitle, newDescription, id } = JSON.parse(req.body);
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getList(id);
  TODO.editList(newTitle, newDescription);
  writeIntoFile(userName);
  res.end();
};

const editItemHandler = function(req, res) {
  const { listId, newDescription, id } = JSON.parse(req.body);
  const userName = getUserName(req.cookie);
  const TODO = getUserTODOs(userName).getList(listId);
  const item = TODO.getItem(id);
  item.editDescription(newDescription);
  writeIntoFile(userName);
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

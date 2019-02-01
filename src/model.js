class Item {
  constructor(description, id, done = false) {
    this.description = description;
    this.id = id;
    this.done = done;
  }
  toggleStatus() {
    this.done = !this.done;
  }
  editDescription(description) {
    this.description = description;
  }
}

class Todo {
  constructor(title, id, description, items = []) {
    this.title = title;
    this.id = id;
    this.description = description;
    this.items = items;
  }
  addItem(description, id) {
    this.items.push(new Item(description, id));
  }
  deleteItem(id) {
    const index = this.items.findIndex(item => item.id == id);
    this.items.copyWithin(index, index + 1);
    this.items.pop();
  }
  getItem(id) {
    return this.items.filter(item => item.id == id)[0];
  }
  editTodo(title, description) {
    this.title = title;
    this.description = description;
  }
}

class Todos {
  constructor(todos = []) {
    this.todos = todos;
  }
  parse(todos) {
    this.todos = todos.map(
      todo =>
        new Todo(
          todo.title,
          todo.id,
          todo.description,
          todo.items.map(item => new Item(item.description, item.id, item.done))
        )
    );
  }
  addTodo(title, id, description) {
    this.todos.push(new Todo(title, id, description));
  }
  deleteTodo(id) {
    const index = this.todos.findIndex(todo => todo.id == id);
    this.todos.copyWithin(index, index + 1);
    this.todos.pop();
  }
  getTodos() {
    return this.todos;
  }
  getTodo(id) {
    return this.todos.filter(todo => todo.id == id)[0];
  }
  getStringifiedTodos() {
    return JSON.stringify(this.todos);
  }
}

class LoggedInUsers {
  constructor(users = {}) {
    this.users = users;
  }
  addUser(userName, userTODOs) {
    this.users[userName] = userTODOs;
  }
  removeUser(userName) {
    delete this.users[userName];
  }
  getTODOs(userName) {
    return this.users[userName];
  }
}

module.exports = { Todos, LoggedInUsers };

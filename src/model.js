const { deleteArrayElement } = require('./utils/arrayUtils.js');

class Item {
  constructor(description, id, done = false) {
    this.description = description;
    this.id = id;
    this.done = done;
  }
  getDescription() {
    return this.description;
  }
  getStatus() {
    return this.done;
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
  getTitle() {
    return this.title;
  }
  getDescription() {
    return this.description;
  }
  getItems() {
    return this.items;
  }
  addItem(item) {
    this.items.push(item);
  }
  deleteItem(id) {
    const index = this.items.findIndex(item => item.id == id);
    this.items = deleteArrayElement(this.items, index);
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
  addTodo(todo) {
    this.todos.push(todo);
  }
  deleteTodo(id) {
    const index = this.todos.findIndex(todo => todo.id == id);
    this.todos = deleteArrayElement(this.todos, index);
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

module.exports = { Todos, Todo, Item, LoggedInUsers };

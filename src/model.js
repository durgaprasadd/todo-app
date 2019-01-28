class List {
  constructor(listName, id, description) {
    this.listName = listName;
    this.id = id;
    this.description = description;
    this.items = [];
  }
  addItem(itemDescription, id) {
    this.items.push(new Item(itemDescription, id));
  }
  getItem(id) {
    return this.items.filter(item => item.id == id)[0];
  }
}

class Item {
  constructor(description, id) {
    this.description = description;
    this.id = id;
    this.done = false;
  }
  toggleStatus() {
    this.done = !this.done;
  }
  editDescription(description) {
    this.description = description;
  }
}

class TodoLists {
  constructor(lists = []) {
    this.lists = lists;
  }
  createObjects(lists) {
    this.lists = lists.map(
      list => new List(list.listName, list.id, list.description)
    );
  }
  addList(listName, id, description) {
    this.lists.push(new List(listName, id, description));
  }
  getLists() {
    return this.lists;
  }
  getList(id) {
    return this.lists.filter(list => list.id == id)[0];
  }
  getStringifiedLists() {
    return JSON.stringify(this.lists);
  }
}

module.exports = TodoLists;

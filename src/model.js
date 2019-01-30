class List {
  constructor(listName, id, description, items = []) {
    this.listName = listName;
    this.id = id;
    this.description = description;
    this.items = items;
  }
  addItem(itemDescription, id) {
    this.items.push(new Item(itemDescription, id));
  }
  deleteItem(id) {
    const index = this.items.findIndex(item => item.id == id);
    this.items.copyWithin(index, index + 1);
    this.items.pop();
  }
  getItem(id) {
    return this.items.filter(item => item.id == id)[0];
  }
  editList(listName, description) {
    this.listName = listName;
    this.description = description;
  }
}

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

class TodoLists {
  constructor(lists = []) {
    this.lists = lists;
  }
  createObjects(lists) {
    this.lists = lists.map(
      list =>
        new List(
          list.listName,
          list.id,
          list.description,
          list.items.map(item => new Item(item.description, item.id, item.done))
        )
    );
  }
  addList(listName, id, description) {
    this.lists.push(new List(listName, id, description));
  }
  deleteList(id) {
    const index = this.lists.findIndex(list => list.id == id);
    this.lists.copyWithin(index, index + 1);
    this.lists.pop();
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

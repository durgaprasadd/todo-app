class List {
  constructor(listName, id) {
    this.listName = listName;
    this.id = id;
    this.items = [];
  }
  addItem(itemDescription) {
    this.items.push(new Item(itemDescription));
  }
}

class Item {
  constructor(description) {
    this.description = description;
    this.status = true;
  }
  toggleStatus() {
    this.status = !this.status;
  }
  editDescription(description) {
    this.description = description;
  }
}

class TodoLists {
  constructor(lists = []) {
    this.lists = lists;
  }
  addList(listName, id) {
    this.lists.push(new List(listName, id));
  }
  getLists() {
    return this.lists;
  }
  getStringifiedLists() {
    return JSON.stringify(this.lists);
  }
}

module.exports = TodoLists;

class List {
  constructor() {
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
  constructor() {
    this.lists = [];
  }
  addList(listName) {
    let list = {};
    list[listName] = new List();
    this.lists.push(list);
  }
}

module.exports = TodoLists;

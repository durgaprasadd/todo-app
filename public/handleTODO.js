const addTextBoxDetails = function(
  textBox,
  rows,
  cols,
  placeholder,
  className,
  id
) {
  textBox.rows = rows;
  textBox.cols = cols;
  textBox.placeholder = placeholder;
  textBox.className = className;
  textBox.id = id;
};

const changeStatus = function(event) {
  const id = event.srcElement.id;
  const listId = window.location.pathname.slice(1);
  fetch('/changeStatus', {
    method: 'POST',
    body: JSON.stringify({ id, listId })
  });
};

const deleteItem = function(id) {
  const listId = window.location.pathname.slice(1);
  const body = { listId, id };
  fetch('/deleteItem', { method: 'POST', body: JSON.stringify(body) }).then(
    res => (window.location = window.location.pathname)
  );
};

const removePreviousEditBoxes = function() {
  let previousDescriptionBox = document.getElementById('_editDescription');
  let previousSubmitButton = document.getElementById('_editSubmit');
  let previousCancelButton = document.getElementById('_editCancel');
  if (previousDescriptionBox) {
    previousDescriptionBox.remove();
    previousSubmitButton.remove();
    previousCancelButton.remove();
  }
};

const addEditDescriptionBoxDetais = function(descriptionBox, description) {
  descriptionBox.value = description;
  descriptionBox.id = '_editDescription';
  descriptionBox.className = 'editDescription';
};

const editItemHandler = function(document, id) {
  const listId = window.location.pathname.slice(1);
  const newDescription = document.getElementById('_editDescription').value;
  const body = { listId, id, newDescription };
  fetch('/editItem', { method: 'POST', body: JSON.stringify(body) }).then(res =>
    location.reload()
  );
};

const addEditSubmitButtonDetais = function(submitButton, id) {
  submitButton.id = '_editSubmit';
  submitButton.innerText = 'Submit';
  submitButton.onclick = editItemHandler.bind(null, document, id);
};

const addCancelButtonDetails = function(cancelButton) {
  cancelButton.id = '_editCancel';
  cancelButton.innerText = 'Cancel';
  cancelButton.onclick = removePreviousEditBoxes;
};

const appendChilds = function(parent, children) {
  children.forEach(child => parent.appendChild(child));
};

const editItem = function(id, description) {
  removePreviousEditBoxes();
  const parent = document.getElementById(`_parent${id}`);
  const descriptionBox = document.createElement('textarea');
  addEditDescriptionBoxDetais(descriptionBox, description);
  const submitButton = document.createElement('button');
  addEditSubmitButtonDetais(submitButton, id);
  const cancelButton = document.createElement('button');
  addCancelButtonDetails(cancelButton);
  appendChilds(parent, [descriptionBox, submitButton, cancelButton]);
};

const addItemDetails = function(item, value, id) {
  item.id = `_parent${id}`;
  item.innerHTML = `<div class="list"><input class="checkbox" onclick="changeStatus(event)" type="checkbox" id=${id}>${value}<button onclick="editItem(${id},'${value}')" class="edit">Edit</button><button onclick="deleteItem(${id})" class="delete">delete</button><br></div>`;
};

const createItem = function(value, id, status = false) {
  const parent = document.getElementById('_items');
  const itemElement = document.createElement('div');
  addItemDetails(itemElement, value, id);
  parent.appendChild(itemElement);
  document.getElementById(id).checked = status;
};

const submitItem = function() {
  const item = document.getElementById('_itemDes');
  const value = item.value;
  const listId = window.location.pathname.slice(1);
  const id = new Date().getTime();
  if (!value) return;
  fetch('/submitItem', {
    method: 'POST',
    body: JSON.stringify({ value, listId, id })
  });
  item.remove();
  document.getElementById('_submitItem').remove();
  createItem(value, id);
  const addItemButton = document.getElementById('_addItem');
  addItemButton.onclick = addItem.bind(null, document, addItemButton);
};

const addSubmitButtonDetails = function(submitButton) {
  submitButton.onclick = submitItem;
  submitButton.innerText = 'submit';
  submitButton.className = 'itemButton';
  submitButton.id = '_submitItem';
};

const addItem = function(document, addItemButton) {
  addItemButton.onclick = '';
  const parent = document.getElementById('_textDiv');
  const textBox = document.createElement('textarea');
  addTextBoxDetails(textBox, 3, 100, '* description *', 'itemDes', '_itemDes');
  const submitButton = document.createElement('button');
  addSubmitButtonDetails(submitButton);
  parent.appendChild(textBox);
  parent.appendChild(submitButton);
};

const logOut = function() {
  fetch('/logout').then(res => (window.location = '/'));
};

const getUserName = function(document) {
  const cookie = document.cookie;
  const index = cookie.indexOf('=');
  return cookie.slice(index + 1);
};

const initializeUserName = function(document) {
  const userName = getUserName(document);
  const userNameId = document.getElementById('_userName');
  userNameId.innerText = `user: ${userName}`;
};

const initialize = function() {
  initializeUserName(document);
  const logOutButton = document.getElementById('_itemLogout');
  logOutButton.onclick = logOut;
  const addItemButton = document.getElementById('_addItem');
  addItemButton.onclick = addItem.bind(null, document, addItemButton);
  fetch('/getInitialTodoItems', {
    method: 'POST',
    body: window.location.pathname.slice(1)
  })
    .then(res => res.json())
    .then(todoItems =>
      todoItems.forEach(todoItem =>
        createItem(todoItem.description, todoItem.id, todoItem.done)
      )
    );
};

window.onload = initialize;

const removeElements = function(document, ids) {
  ids.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.remove();
  });
};

const getValue = function(document, id) {
  return document.getElementById(id).value;
};

const createList = function(document) {
  let title = getValue(document, '_titleBox');
  let description = getValue(document, '_descriptionBox');
  if (!title) return;
  let id = new Date().getTime();
  let body = {id, title, description };

  fetch('/addList', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  addList(document, title, id, description);
  removeElements(document, ['_titleBox', '_submit', '_descriptionBox']);
};

const deleteList = function(id) {
  fetch('/deleteList', {
    method: 'POST',
    body: id
  }).then(() => (window.location = '/'));
};

const editListHandler = function(document, id) {
  const newTitle = getValue(document, '_editTitleBox');
  const newDescription = getValue(document, '_editDescriptionBox');
  const body = { newTitle, newDescription, id };

  fetch('/editList', { method: 'POST', body: JSON.stringify(body) }).then(() =>
    location.reload()
  );
};

const createEditSubmitButton = function(document, id) {
  const submitButton = document.createElement('button');
  submitButton.id = '_editSubmit';
  submitButton.className = 'editSubmit';
  submitButton.innerText = 'Submit';
  submitButton.onclick = editListHandler.bind(null, document, id);
  return submitButton;
};

const createEditTitleBox = function(document, title) {
  const editTitleBox = document.createElement('textarea');
  editTitleBox.value = title;
  editTitleBox.id = '_editTitleBox';
  editTitleBox.className = 'editTitle';
  return editTitleBox;
};

const createEditDescriptionBox = function(document, description) {
  const editDescriptionBox = document.createElement('textarea');
  editDescriptionBox.value = description;
  editDescriptionBox.id = '_editDescriptionBox';
  editDescriptionBox.className = 'editDescription';
  return editDescriptionBox;
};

const createCancelButton = function(document) {
  const cancelButton = document.createElement('button');
  cancelButton.id = '_editCancel';
  cancelButton.className = 'editCancel';
  cancelButton.innerText = 'Cancel';
  cancelButton.onclick = removeElements.bind(null, document, ['_editDiv']);
  return cancelButton;
};

const createEditDiv = function(document) {
  const editDiv = document.createElement('div');
  editDiv.id = '_editDiv';
  editDiv.style.display = 'flex';
  editDiv.style.alignItems = 'center';
  return editDiv;
};

const appendChildren = function(parent, children) {
  children.forEach(child => parent.appendChild(child));
};

const editList = function(id, title, description) {
  removeElements(document, ['_editDiv']);
  const parent = document.getElementById(id);
  const editDiv = createEditDiv(document);
  const editTitleBox = createEditTitleBox(document, title);
  const editDescriptionBox = createEditDescriptionBox(document, description);
  const submitButton = createEditSubmitButton(document, id);
  const cancelButton = createCancelButton(document);
  appendChildren(editDiv, [
    editTitleBox,
    editDescriptionBox,
    submitButton,
    cancelButton
  ]);
  appendChildren(parent, [editDiv]);
};

const addList = function(document, title, id, description) {
  let parent = document.getElementById('_lists');
  let newList = document.createElement('div');
  newList.innerHTML = `<div class='todo' ><a class="link" href="${id}">>> ${title}</a><button onclick="editList('${id}','${title}','${description}')" id="_${id}edit" class="edit">Edit</button><button onclick = "deleteList(${id})" class="delete">Delete</button></div>`;
  newList.id = id;
  parent.appendChild(newList);
};

const createTextBox = function(details) {
  const textBox = document.createElement('textarea');
  textBox.rows = details.rows;
  textBox.col = details.col;
  textBox.placeholder = details.placeholder;
  textBox.className = details.className;
  textBox.id = details.id;
  return textBox;
};

const createSubmitButton = function(document) {
  const submitButton = document.createElement('button');
  submitButton.innerText = 'Submit';
  submitButton.className = 'submitButton';
  submitButton.id = '_submit';
  submitButton.onclick = createList.bind(null, document);
  return submitButton;
};

const createNewTodoForm = function(document, title, description) {
  const parent = document.getElementById('_lists');
  const titleBoxDetais = {
    rows: 3,
    col: 50,
    placeholder: '* Title *',
    className: 'titleBox',
    id: '_titleBox'
  };
  const descriptionBoxDetails = {
    rows: 6,
    col: 50,
    placeholder: '* Description *',
    className: 'descriptionBox',
    id: '_descriptionBox'
  };
  const titleBox = createTextBox(titleBoxDetais);
  const descriptionBox = createTextBox(descriptionBoxDetails);
  const submitButton = createSubmitButton(document);
  appendChildren(parent, [titleBox, descriptionBox, submitButton]);
};

const getStoredTodoLists = function(document) {
  fetch('/getTodoLists')
    .then(res => res.json())
    .then(listsDetails => {
      listsDetails.forEach(listDetails =>
        addList(
          document,
          listDetails.title,
          listDetails.id,
          listDetails.description
        )
      );
    });
};

const getUserName = function(document) {
  const cookie = document.cookie;
  const index = cookie.indexOf('=');
  return cookie.slice(index + 1);
};

const initializeUserName = function(document) {
  const userName = getUserName(document);
  const userNameId = document.getElementById('_userName');
  userNameId.innerText = userName;
};

const initialize = function() {
  initializeUserName(document);
  const addListButton = document.getElementById('_addList');
  addListButton.onclick = createNewTodoForm.bind(null, document);
  getStoredTodoLists(document);
};

window.onload = initialize;

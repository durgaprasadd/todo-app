const createList = function(document) {
  let title = document.getElementById('_title').value;
  if (!title) return;
  let description = document.getElementById('_description').value;
  let id = new Date().getTime();
  let body = { id, title, description };
  const req = new Request('/addList', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  fetch(req)
    .then(res => res.text())
    .then(content => {
      addList(document, title, id, description);
      document.getElementById('_title').remove();
      document.getElementById('_submit').remove();
      document.getElementById('_description').remove();
    });
};

const deleteList = function(id) {
  fetch('/deleteList', {
    method: 'POST',
    body: id
  }).then(res => (window.location = '/'));
};

const removePreviousEditBoxes = function() {
  let previousTitleBox = document.getElementById('_editTitle');
  let previousDescriptionBox = document.getElementById('_editDescription');
  let previousSubmitButton = document.getElementById('_editSubmit');
  let previousCancelButton = document.getElementById('_editCancel');
  if (previousTitleBox || previousDescriptionBox) {
    previousTitleBox.remove();
    previousDescriptionBox.remove();
    previousSubmitButton.remove();
    previousCancelButton.remove();
  }
};

const editListHandler = function(document, id) {
  const newTitle = document.getElementById('_editTitle').value;
  const newDescription = document.getElementById('_editDescription').value;
  const body = { newTitle, newDescription, id };
  fetch('/editList', { method: 'POST', body: JSON.stringify(body) }).then(res =>
    location.reload()
  );
};

const addEditSubmitButtonDetais = function(submitButton, id) {
  submitButton.id = '_editSubmit';
  submitButton.innerText = 'Submit';
  submitButton.onclick = editListHandler.bind(null, document, id);
};

const addEditTitleBoxDetais = function(titleBox, title) {
  titleBox.value = title;
  titleBox.id = '_editTitle';
  titleBox.className = 'editTitle';
};

const addEditDescriptionBoxDetais = function(descriptionBox, description) {
  descriptionBox.value = description;
  descriptionBox.id = '_editDescription';
  descriptionBox.className = 'editDescription';
};

const addCancelButtonDetails = function(cancelButton) {
  cancelButton.id = '_editCancel';
  cancelButton.innerText = 'Cancel';
  cancelButton.onclick = removePreviousEditBoxes;
};

const appendChilds = function(parent, children) {
  children.forEach(child => parent.appendChild(child));
};

const editList = function(id, title, description) {
  removePreviousEditBoxes();
  const parent = document.getElementById(id);
  const titleBox = document.createElement('textarea');
  addEditTitleBoxDetais(titleBox, title);
  const descriptionBox = document.createElement('textarea');
  addEditDescriptionBoxDetais(descriptionBox, description);
  const submitButton = document.createElement('button');
  addEditSubmitButtonDetais(submitButton, id);
  const cancelButton = document.createElement('button');
  addCancelButtonDetails(cancelButton);
  appendChilds(parent, [titleBox, descriptionBox, submitButton, cancelButton]);
};

const addList = function(document, title, id, description) {
  let parent = document.getElementById('_lists');
  let newList = document.createElement('div');
  newList.innerHTML = `<div class='list' ><a class="link" href="${id}">>> ${title}</a><button onclick="editList('${id}','${title}','${description}')" id="_${id}edit" class="edit">Edit</button><button onclick = "deleteList(${id})" class="delete">Delete</button></div>`;
  newList.id = id;
  parent.appendChild(newList);
};

const addTextBoxDetails = function(
  textBox,
  rows,
  col,
  placeholder,
  className,
  id
) {
  textBox.rows = rows;
  textBox.col = col;
  textBox.placeholder = placeholder;
  textBox.className = className;
  textBox.id = id;
};

const addSubmitButtonDetails = function(submitButton) {
  submitButton.innerText = 'submit';
  submitButton.className = 'submitButton';
  submitButton.id = '_submit';
  submitButton.onclick = createList.bind(null, document);
};

const createTextBox = function(document, title, description) {
  let parent = document.getElementById('_lists');
  let titleBox = document.createElement('textarea');
  let descriptionBox = document.createElement('textarea');
  addTextBoxDetails(titleBox, 3, 50, '* title *', 'titleBox', '_title');
  addTextBoxDetails(
    descriptionBox,
    6,
    50,
    '* description *',
    'descriptionBox',
    '_description'
  );
  let submitButton = document.createElement('button');
  addSubmitButtonDetails(submitButton);
  parent.appendChild(titleBox);
  parent.appendChild(descriptionBox);
  parent.appendChild(submitButton);
};

const getStoredTodoLists = function(document) {
  fetch('/getTodoLists')
    .then(res => res.text())
    .then(data => {
      let listsDetails = JSON.parse(data);
      listsDetails.forEach(listDetails =>
        addList(
          document,
          listDetails.listName,
          listDetails.id,
          listDetails.description
        )
      );
    });
};

const logout = function() {
  fetch('/logout').then(res => (window.location = '/'));
};

const initialize = function() {
  const addListButton = document.getElementById('_addList');
  addListButton.onclick = createTextBox.bind(null, document);
  const logoutButton = document.getElementById('_logout');
  logoutButton.onclick = logout;
  getStoredTodoLists(document);
};

window.onload = initialize;

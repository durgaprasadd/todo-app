const createList = function(document) {
  let title = document.getElementById('_title').value;
  let id = new Date().getTime();
  let body = { id, title };
  const req = new Request('/addList', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  fetch(req)
    .then(res => res.text())
    .then(content => {
      addList(document, title, id);
      document.getElementById('_title').remove();
      document.getElementById('_submit').remove();
    });
};

const addList = function(document, title, id) {
  let parent = document.getElementById('_lists');
  let newList = document.createElement('a');
  newList.href = id;
  newList.innerHTML = `<div class="list">${title}</div>`;
  parent.appendChild(newList);
};

const addTextBoxDetails = function(textBox) {
  textBox.rows = 5;
  textBox.col = 50;
  textBox.placeholder = '*  title  *';
  textBox.className = 'textBox';
  textBox.id = '_title';
};

const addSubmitButtonDetails = function(submitButton) {
  submitButton.innerText = 'submit';
  submitButton.className = 'submitButton';
  submitButton.id = '_submit';
  submitButton.onclick = createList.bind(null, document);
};

const createTextBox = function(document) {
  let parent = document.getElementById('_lists');
  let textBox = document.createElement('textarea');
  addTextBoxDetails(textBox);
  let submitButton = document.createElement('button');
  addSubmitButtonDetails(submitButton);
  parent.appendChild(textBox);
  parent.appendChild(submitButton);
};

const getStoredTodoLists = function(document) {
  fetch('/getTodoLists')
    .then(res => res.text())
    .then(data => {
      let listsDetails = JSON.parse(data);
      listsDetails.forEach(listDetails =>
        addList(document, listDetails.listName, listDetails.id)
      );
    });
};

const logout = function(document) {
  fetch('/logout').then(res => (window.location = '/'));
};

const initialize = function() {
  const addListButton = document.getElementById('_addList');
  addListButton.onclick = createTextBox.bind(null, document);
  const logoutButton = document.getElementById('_logout');
  logoutButton.onclick = logout.bind(null, document);
  getStoredTodoLists(document);
};

window.onload = initialize;

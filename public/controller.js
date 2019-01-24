const createList = function(document) {
  let title = document.getElementById('_title').value;
  const req = new Request('/addList', { method: 'POST', body: title });
  fetch(req)
    .then(res => res.text())
    .then(content => {
      addList(document, title);
    });
};

const addList = function(document, title) {
  let parent = document.getElementById('_lists');
  let newList = document.createElement('div');
  newList.className = 'list';
  newList.innerText = title;
  parent.appendChild(newList);
  document.getElementById('_title').remove();
  document.getElementById('_submit').remove();
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

const initialize = function() {
  const addListButton = document.getElementById('_addList');
  addListButton.onclick = createTextBox.bind(null, document);
};

window.onload = initialize;

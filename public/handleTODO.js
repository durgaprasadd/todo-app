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

const addItemDetails = function(item, value, className, id) {
  item.className = className;
  item.innerHTML = `<input class="checkbox" onclick="changeStatus(event)" type="checkbox" id=${id}>${value}<br>`;
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
  initialize();
  const parent = document.getElementById('_items');
  const itemElement = document.createElement('div');
  addItemDetails(itemElement, value, 'list', id);
  parent.appendChild(itemElement);
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

const initialize = function() {
  const addItemButton = document.getElementById('_addItem');
  addItemButton.onclick = addItem.bind(null, document, addItemButton);
};

window.onload = initialize;

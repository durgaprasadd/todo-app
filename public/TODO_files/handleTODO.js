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

const addItemDetails = function(item, value, className) {
  item.className = className;
  item.innerHTML = `<input class="checkbox" type="checkbox" value="">${value}<br>`;
};

const submitItem = function() {
  const item = document.getElementById('_itemDes');
  const value = item.value;
  const id = window.location.pathname.slice(1);
  fetch('/submitItem', { method: 'POST', body: JSON.stringify({ value, id }) });
  item.remove();
  document.getElementById('_submitItem').remove();
  initialize();
  const parent = document.getElementById('_items');
  const itemElement = document.createElement('div');
  addItemDetails(itemElement, value, 'list');
  parent.appendChild(itemElement);
};

const addSubmitButtonDetails = function(submitButton) {
  submitButton.onclick = submitItem;
  submitButton.innerText = 'submit';
  submitButton.className = 'submitItem';
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

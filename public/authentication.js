const getAuthDiv = function(divType, otherType) {
  const authDiv = elementById('authDiv');
  elementById(divType).style.color = 'red';
  elementById(otherType).style.color = 'black';
  authDiv.innerHTML = divs[divType];
};

const elementById = function(id) {
  return document.getElementById(id);
};

const showSignupResult = function(content) {
  elementById('newPassword').value = '';
  if (content === 'alreadyExists') {
    elementById('_status').innerText = 'UserName Already Exists';
    return;
  }
  elementById('_status').innerText = 'Sign up Successful!';
  elementById('newUser').value = '';
};

const showLoginResult = function(content) {
  elementById('userName').value = '';
  elementById('password').value = '';
  if (content === 'notExist') {
    elementById('_status').innerText = 'UserName Not Matched';
    return;
  }
  if (content === 'incorrectPassword') {
    elementById('_status').innerText = 'Incorrect Password';
    return;
  }
  window.location = 'dashboard';
};

const createUser = function(event) {
  event.preventDefault();
  const userName = elementById('newUser').value;
  const password = elementById('newPassword').value;
  const body = { userName, password };
  fetch('/createUser', {
    method: 'POST',
    body: JSON.stringify(body)
  })
    .then(res => res.text())
    .then(content => showSignupResult(content));
};

const getUser = function() {
  const userName = elementById('userName').value;
  const password = elementById('password').value;
  return { userName, password };
};

const validateUser = function(event) {
  event.preventDefault();
  const user = getUser();
  fetch('/validateUser', { method: 'POST', body: JSON.stringify(user) })
    .then(res => res.text())
    .then(content => showLoginResult(content));
};

const divs = {
  login: `<form onsubmit="validateUser(event)">
  <div id="_status" class="status"></div>
  <p class="field">Username : <input class="field" id="userName" type="text" required/></p>
  <p class="field">Password : <input class="field" id="password" type="password" required/></p>
  <input class="field" type="submit" value="Confirm"/>
  </form>`,
  signup: `<form onsubmit="createUser(event)" >
  <div id="_status" class="status"></div>
  <p class="field">Username : <input class="field" id="newUser" type="text" required/></p>
  <p class="field">Password : <input class="field" id="newPassword" type="password" required/></p>
  <input class="field" type="submit" value="Create Account"/>
  </form>`
};

const initialize = function() {
  const logiButton = elementById('login');
  logiButton.onclick = getAuthDiv.bind(null, 'login', 'signup');
  const signupButton = elementById('signup');
  signupButton.onclick = getAuthDiv.bind(null, 'signup', 'login');
};

window.onload = initialize;

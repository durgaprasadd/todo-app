const getAuthDiv = function(document, divType) {
  const authDiv = document.getElementById('authDiv');
  authDiv.innerHTML = divs[divType];
};

const divs = {
  loginDiv: `<form method="POST" action="/login">
  <p class="field">Username : <input class="field" name="userName" type="text"/></p>
  <p class="field">Password : <input class="field" name="password" type="password"/></p>
  <input class="field" type="submit"/>
  </form>`,
  signupDiv: `<form method="POST" action="/signup">
  <p class="field">Username : <input class="field" name="userName" type="text"/></p>
  <p class="field">Password : <input class="field" name="password" type="password"/></p>
  <input class="field" type="submit"/>
  </form>`
};

const initialize = function() {
  const logiButton = document.getElementById('login');
  logiButton.onclick = getAuthDiv.bind(null, document, 'loginDiv');
  const signupButton = document.getElementById('signup');
  signupButton.onclick = getAuthDiv.bind(null, document, 'signupDiv');
};

window.onload = initialize;

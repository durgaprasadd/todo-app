const getAuthDiv = function(document, divType, otherType) {
  const authDiv = document.getElementById('authDiv');
  document.getElementById(divType).style.color = 'red';
  document.getElementById(otherType).style.color = 'black';
  authDiv.innerHTML = divs[divType];
};

const divs = {
  login: `<form method="POST" action="/login">
  <p class="field">Username : <input class="field" name="userName" type="text"/></p>
  <p class="field">Password : <input class="field" name="password" type="password"/></p>
  <input class="field" type="submit" value="Confirm"/>
  </form>`,
  signup: `<form method="POST" action="/signup">
  <p class="field">Username : <input class="field" name="userName" type="text"/></p>
  <p class="field">Password : <input class="field" name="password" type="password"/></p>
  <input class="field" type="submit" value="Create Account"/>
  </form>`
};

const initialize = function() {
  const logiButton = document.getElementById('login');
  logiButton.onclick = getAuthDiv.bind(null, document, 'login', 'signup');
  const signupButton = document.getElementById('signup');
  signupButton.onclick = getAuthDiv.bind(null, document, 'signup', 'login');
};

window.onload = initialize;

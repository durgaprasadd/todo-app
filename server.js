const app = require('./src/app.js');
const { getUsers } = require('./src/extractServerPrerequisites.js');
const PORT = process.env.PORT || 8080;

app.users = getUsers();

app.listen(PORT, () => {
  console.log('Listening on port ', PORT);
});

const fs = require('fs');
const Users = require('./users.js');
const { FILES } = require('./constants.js');

const initializePrivateDir = function() {
  fs.mkdirSync('./private');
  fs.mkdirSync('./private/TODOs');
  fs.writeFileSync(FILES.usersFile, '[]');
};

const getStoredUsers = function() {
  if (!fs.existsSync('./private')) {
    initializePrivateDir();
  }
  const storedUsers = fs.readFileSync(FILES.usersFile);
  return JSON.parse(storedUsers);
};

const getUsers = function() {
  return new Users(getStoredUsers());
};

module.exports = { getUsers };

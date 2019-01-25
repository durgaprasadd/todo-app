class Users {
  constructor(users = []) {
    this.users = users;
  }
  getUsers() {
    return this.users;
  }
  addUser(user) {
    this.users.push(user);
  }
  getStringifiedUsers() {
    return JSON.stringify(this.users);
  }
  doesUserExist(userName) {
    return this.users.some(user => user.userName === userName);
  }
  isValidUser({ userName, password }) {
    return this.users.some(
      user => user.userName === userName && user.password === password
    );
  }
}

module.exports = Users;

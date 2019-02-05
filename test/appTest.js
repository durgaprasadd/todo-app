const request = require('supertest');
const Users = require('../src/users.js');
const app = require('../src/app.js');

describe('GET /', function() {
  it('respond with text/html, 200 status code and login page', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('content-type', 'text/html; charset=utf-8')
      .end(done);
  });
});

describe('POST /', function() {
  it('respond with text/html, 200 status code and dashboard', function(done) {
    const rawUsersData = [{ userName: 'testuser', password: 'p@ssword' }];
    app.users = new Users(rawUsersData);
    request(app)
      .post('/validateUser')
      .send({ userName: 'affishaikh', password: 'kakashi' })
      .expect(200)
      .expect('content-type', 'text/plain')
      .end(done);
  });
});

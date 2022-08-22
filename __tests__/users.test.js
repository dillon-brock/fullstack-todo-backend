const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  password: 'abc123',
};

describe('user routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('#POST to /api/v1/users should create a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(testUser);
    expect(res.body).toEqual({
      id: expect.any(String),
      email: testUser.email,
      firstName: 'Test',
      lastName: 'User',
    });
  });
  afterAll(() => {
    pool.end();
  });
});

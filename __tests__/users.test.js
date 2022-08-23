const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  password: 'abc123',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? testUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...userProps, ...testUser });

  const { firstName, lastName, email } = user;
  await agent
    .post('/api/v1/users')
    .send({ firstName, lastName, email, password });
  return agent;
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
  it('#GET /api/v1/users/me should return current user', async () => {
    const agent = await registerAndLogin();
    const res = await agent.get('/api/v1/users/me');
    const { firstName, lastName, email } = testUser;
    expect(res.body).toEqual({
      id: expect.any(String),
      exp: expect.any(Number),
      iat: expect.any(Number),
      firstName,
      lastName,
      email,
    });
  });
  it('#GET /api/v1/users/me should give 401 if no user is signed in', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
  afterAll(() => {
    pool.end();
  });
});

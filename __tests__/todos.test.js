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
  return [agent, user];
};

describe('todos', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });
  it('#POST /api/v1/todos should create a new todo for the current user', async () => {
    const [agent] = await registerAndLogin();
    const todo = { task: 'debug issue with cookies' };
    const res = await agent.post('/api/v1/todos').send(todo);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      task: 'debug issue with cookies',
      user_id: expect.any(String),
      completed: false,
    });
  });
});

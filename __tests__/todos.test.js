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

  const user = await UserService.create({ ...testUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return agent;
};

describe('todos', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });
  it('#POST /api/v1/todos should create a new todo for the current user', async () => {
    const agent = await registerAndLogin();
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
  it('#POST /api/v1/todos should give 401 if user is not signed in', async () => {
    const todo = { task: 'debug issue with cookies' };
    const res = await request(app).post('/api/v1/todos').send(todo);
    expect(res.status).toBe(401);
  });
  it('#GET /api/v1/todos should return a list of todos for current user', async () => {
    const todos = [
      { task: 'laundry' },
      { task: 'restring guitar' },
      { task: 'make the bed' },
    ];
    const agent = await registerAndLogin();
    for (const todo of todos) {
      await agent.post('/api/v1/todos').send(todo);
    }
    const res = await agent.get('/api/v1/todos');
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      task: expect.any(String),
      completed: false,
      user_id: expect.any(String),
    });
  });
  it('#GET /api/v1/todos should give 401 if user is not signed in', async () => {
    const res = await request(app).get('/api/v1/todos');
    expect(res.status).toBe(401);
  });
  it('#PUT /api/v1/todos/:id should update a todo with id matching params', async () => {
    const mockUser = {
      firstName: 'Mock',
      lastName: 'User',
      email: 'mockuser@test.com',
      password: 'abc123',
    };
    const todo = { task: 'take a nap' };
    const agent = await registerAndLogin(mockUser);
    const postedTodo = await agent.post('/api/v1/todos').send(todo);
    const res = await agent
      .put(`/api/v1/todos/${postedTodo.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      task: 'take a nap',
      id: expect.any(String),
      completed: true,
      user_id: expect.any(String),
    });
  });
  it('#PUT should give a 403 if invalid user', async () => {
    const todo = { task: 'water plants' };
    const mockUser = {
      firstName: 'Mock',
      lastName: 'User',
      email: 'mockuser@test.com',
      password: 'abc123',
    };
    const postAgent = await registerAndLogin();
    const newTodo = await postAgent.post('/api/v1/todos').send(todo);
    const updateAgent = await registerAndLogin(mockUser);
    const res = await updateAgent
      .put(`/api/v1/todos/${newTodo.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(403);
  });
  it('#PUT should give 401 if user is not signed in', async () => {
    const agent = await registerAndLogin();
    const todo = { task: 'take out trash' };
    const newTodo = await agent.post('/api/v1/todos').send(todo);
    const res = await request(app).put(`/api/v1/todos/${newTodo.body.id}`);
    expect(res.status).toBe(401);
  });
});

const request = require('supertest');
const express = require('express');
const router = require('../src/router');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(express.json());
app.use(router);

let mongoServer = new MongoMemoryServer();

beforeAll(async () => {
  await mongoServer.start();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('API Routes', () => {
  let token;
  let todoId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/login')
      .send({ password: 'abc' });
    token = response.body.token;
  });

  test('POST /todos', async () => {
    const response = await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Test Todo' });

    expect(response.statusCode).toBe(201);
    todoId = response.body._id;
  });

  test('GET /todos', async () => {
    const response = await request(app)
      .get('/todos')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });

  test('PUT /todos/:id', async () => {
    const response = await request(app)
      .put(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Updated Todo', completed: true });
    expect(response.statusCode).toBe(200);
  });

  test('DELETE /todos/:id', async () => {
    const response = await request(app)
      .delete(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });

  /** 401 Tests */

  test('POST /todos without token', async () => {
    const response = await request(app)
      .post('/todos')
      .send({ text: 'Test Todo' });
    expect(response.statusCode).toBe(401);
  });

  test('GET /todos without token', async () => {
    const response = await request(app).get('/todos');
    expect(response.statusCode).toBe(401);
  });

  test('PUT /todos/:id without token', async () => {
    const response = await request(app)
      .put(`/todos/${todoId}`)
      .send({ text: 'Updated Todo', completed: true });
    expect(response.statusCode).toBe(401);
  });

  test('DELETE /todos/:id without token', async () => {
    const response = await request(app).delete(`/todos/${todoId}`);
    expect(response.statusCode).toBe(401);
  });
});

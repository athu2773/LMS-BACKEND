const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
require('dotenv').config();

// Setup and teardown
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  let testUser = { name: 'Test User', email: 'testuser@example.com', password: 'TestPass123!', role: 'student' };
  let token;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
  });

  it('should not register an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('should not login with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPass' });
    expect(res.statusCode).toBe(401);
  });

  it('should get user profile with token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });
});

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
require('dotenv').config();

let instructorToken, studentToken, adminToken, courseId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Register and login users for each role
  const users = [
    { name: 'Instructor', email: 'instructor@example.com', password: 'TestPass123!', role: 'instructor' },
    { name: 'Student', email: 'student@example.com', password: 'TestPass123!', role: 'student' },
    { name: 'Admin', email: 'admin@example.com', password: 'TestPass123!', role: 'admin' },
  ];
  for (const user of users) {
    await request(app).post('/api/auth/register').send(user);
  }
  const login = async (email, password) => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    return res.body.token;
  };
  instructorToken = await login('instructor@example.com', 'TestPass123!');
  studentToken = await login('student@example.com', 'TestPass123!');
  adminToken = await login('admin@example.com', 'TestPass123!');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Course API', () => {
  it('should allow instructor to create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Test Course',
        description: 'A course for testing',
        instructor: '', // will be set by backend
        syllabus: [{ unitTitle: 'Unit 1', objectives: ['Obj1'], timeline: 'Week 1', lessons: [], assessments: [] }],
        content: 'Initial content',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Course');
    courseId = res.body._id;
  });

  it('should allow anyone to get all courses', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow anyone to get a course by id', async () => {
    const res = await request(app).get(`/api/courses/${courseId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(courseId);
  });

  it('should allow instructor to update course content', async () => {
    const res = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ content: 'Updated content' });
    expect(res.statusCode).toBe(200);
    expect(res.body.content.length).toBeGreaterThan(1);
  });

  it('should allow admin to approve the course', async () => {
    const res = await request(app)
      .patch(`/api/courses/${courseId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.course.approvalStatus).toBe('approved');
  });

  it('should allow admin to reject the course', async () => {
    const res = await request(app)
      .patch(`/api/courses/${courseId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.course.approvalStatus).toBe('rejected');
  });

  it('should allow instructor to delete the course', async () => {
    const res = await request(app)
      .delete(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Course deleted');
  });

  it('should not allow creating a course without a token', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({ title: 'No Auth', description: 'No token', syllabus: [], content: 'x' });
    expect(res.statusCode).toBe(401);
  });

  it('should not allow student to create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Student Course', description: 'Should fail', syllabus: [], content: 'x' });
    expect(res.statusCode).toBe(403);
  });

  it('should not allow creating a course with missing title', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ description: 'No title', syllabus: [], content: 'x' });
    expect(res.statusCode).toBe(500); // Joi validation is not used in controller, so 500
  });

  it('should return 404 for non-existent course', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/courses/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  it('should not allow another instructor to update a course', async () => {
    // Register a second instructor
    await request(app).post('/api/auth/register').send({ name: 'Other', email: 'other@ex.com', password: 'TestPass123!', role: 'instructor' });
    const otherToken = await request(app).post('/api/auth/login').send({ email: 'other@ex.com', password: 'TestPass123!' }).then(r => r.body.token);
    // Create a new course as first instructor
    const newCourse = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'Other Course', description: 'x', syllabus: [{ unitTitle: 'U', objectives: [], timeline: '', lessons: [], assessments: [] }], content: 'x' });
    // Try to update as other instructor
    const res = await request(app)
      .put(`/api/courses/${newCourse.body._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Hacked' });
    expect(res.statusCode).toBe(403);
  });

  it('should not allow non-admin to approve a course', async () => {
    // Create a new course as instructor
    const newCourse = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({ title: 'To Approve', description: 'x', syllabus: [{ unitTitle: 'U', objectives: [], timeline: '', lessons: [], assessments: [] }], content: 'x' });
    // Try to approve as instructor
    const res = await request(app)
      .patch(`/api/courses/${newCourse.body._id}/approve`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.statusCode).toBe(403);
  });
});

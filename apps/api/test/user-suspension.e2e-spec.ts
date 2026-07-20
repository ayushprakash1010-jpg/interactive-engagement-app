import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

describe('User Suspension (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    connection = app.get(getConnectionToken());
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  describe('Host access after suspension', () => {
    it('should return 401 Unauthorized for a suspended host accessing a protected route', async () => {
      // Create a test user
      const user = await connection.collection('users').insertOne({
        auth0Sub: 'auth0|test-suspended-host',
        email: 'suspended@test.com',
        name: 'Suspended Host',
        role: 'host',
        isSuspended: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const token = jwtService.sign({
        sub: 'auth0|test-suspended-host',
        email: 'suspended@test.com',
      });

      // Try to access a Host-protected route (e.g. /events)
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      // The JwtStrategy should reject the user because isSuspended is true
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('User account is suspended');

      await connection.collection('users').deleteOne({ _id: user.insertedId });
    });
  });
});

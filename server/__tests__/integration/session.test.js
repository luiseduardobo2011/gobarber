import request from 'supertest';

import app from '../../src/app';

import truncate from '../util/truncate';
import factory from '../factories';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });
  it('Should be able to login', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    await request(app)
      .post('/sessions')
      .send({ email: user.email, password: user.password })
      .expect(res => 'token' in res.headers);
  });
  it('Should not abble to login with a invalid email and password', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/sessions')
      .send({ email: user.email, password: user.password })
      .expect(res => !('token' in res.headers));
  });
});

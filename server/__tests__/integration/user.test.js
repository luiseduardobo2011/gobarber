import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../../src/app';

import truncate from '../util/truncate';
import factory from '../factories';

describe('User', () => {
  beforeEach(async () => {
    await truncate();
  });
  it('Should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it('Should not be able to register with diplicated email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('Should encrypt user password when new user created', async () => {
    const user = await factory.create('User', { password: '123456' });

    const compareHash = await bcrypt.compare('123456', user.password_hash);

    expect(compareHash).toBe(true);
  });

  // update
  it('Should be able to update and login again', async () => {
    await truncate();
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    let loginResponse = await request(app)
      .post('/sessions')
      .send({ email: user.email, password: user.password });

    loginResponse = JSON.parse(loginResponse.res.text);

    const updatedUser = await factory.attrs('User', {
      oldPassword: user.password,
    });

    await request(app)
      .put('/users')
      .set({ Authorization: `bearer ${loginResponse.token}` })
      .send(updatedUser);

    let loginResponseAfterUpdate = await request(app)
      .post('/sessions')
      .send({
        email: updatedUser.email,
        password: updatedUser.password,
      });

    loginResponseAfterUpdate = JSON.parse(loginResponseAfterUpdate.res.text);

    expect(loginResponseAfterUpdate).toHaveProperty('token');
  });
});

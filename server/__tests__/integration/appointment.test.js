import request from 'supertest';
import moment from 'moment';

import app from '../../src/app';

// import truncate from '../util/truncate';
import factory from '../factories';

let user;
let loginResponse;
let responseProvider;
let provider;

describe('Appointment', () => {
  // beforeEach(async () => {
  //   await truncate();
  // });
  it('Should be able to create a appointment', async () => {
    user = await factory.attrs('User');
    await request(app)
      .post('/users')
      .send(user);

    provider = await factory.attrs('Provider');
    responseProvider = await request(app)
      .post('/users')
      .send(provider);
    loginResponse = await request(app)
      .post('/sessions')
      .send({ email: user.email, password: user.password });

    loginResponse = JSON.parse(loginResponse.res.text);

    const appointment = await factory.attrs('Appointment', {
      provider_id: responseProvider.body.id,
    });

    const appoitmentResponse = await request(app)
      .post('/appointments')
      .set({ Authorization: `bearer ${loginResponse.token}` })
      .send(appointment);

    expect(appoitmentResponse.body).toHaveProperty('id');
  });

  it('Should to block appointment in past', async () => {
    const appointment = await factory.attrs('Appointment', {
      date: () => {
        return moment()
          .subtract(1, 'hours')
          .format('YYYY-MM-DD HH:MM:ss');
      },
      provider_id: responseProvider.body.id,
    });

    const appoitmentResponse = await request(app)
      .post('/appointments')
      .set({ Authorization: `bearer ${loginResponse.token}` })
      .send(appointment);

    expect(appoitmentResponse.statusCode).toBe(400);
  });

  it('Should to check availability before schdule', async () => {
    const appointment = await factory.attrs('Appointment', {
      provider_id: responseProvider.body.id,
    });

    await request(app)
      .post('/appointments')
      .set({ Authorization: `bearer ${loginResponse.token}` })
      .send(appointment);

    const appoitmentResponse = await request(app)
      .post('/appointments')
      .set({ Authorization: `bearer ${loginResponse.token}` })
      .send(appointment);

    expect(appoitmentResponse.statusCode).toBe(400);
  });
});

import request from 'supertest';
import moment from 'moment';

import app from '../../src/app';

// import truncate from '../util/truncate';
import factory from '../factories';

let user;
let loginResponse;
let loginProviderResponse;
let responseProvider;
let provider;
let globalAppointmentResponse;

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

    globalAppointmentResponse = await request(app)
      .post('/appointments')
      .set({ Authorization: `bearer ${loginResponse.token}` })
      .send(appointment);

    expect(globalAppointmentResponse.body).toHaveProperty('id');
  });

  it('Should to block appointment in past', async () => {
    const appointment = await factory.attrs('AppointmentPast', {
      provider_id: responseProvider.body.id,
    });

    const appoitmentResponse = await request(app)
      .post('/appointments')
      .set({ Authorization: `bearer ${loginResponse.token}` })
      .send(appointment);

    expect(appoitmentResponse.statusCode).toBe(400);
  });

  it('Should to check availability before scheduled', async () => {
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

  it('Should to return a list of appoitments', async () => {
    const appoitments = await request(app)
      .get('/appointments')
      .set({ Authorization: `bearer ${loginResponse.token}` });
    expect(appoitments.body.length).toEqual(2);
  });
});

describe('Appointment', () => {
  it('Should to return a schedule of a provider', async () => {
    loginProviderResponse = await request(app)
      .post('/sessions')
      .send({ email: provider.email, password: provider.password });

    loginProviderResponse = JSON.parse(loginProviderResponse.res.text);

    const appoitments = await request(app)
      .get('/schedule')
      .set({ Authorization: `bearer ${loginProviderResponse.token}` })
      .query({ date: globalAppointmentResponse.body.date });

    expect(appoitments.body.length).toBeGreaterThanOrEqual(1);
  });
});

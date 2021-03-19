import faker from 'faker';
import { factory } from 'factory-girl';
import moment from 'moment';

import User from '../src/app/models/User';
import Appointment from '../src/app/models/Appointment';

function getRandomInt(min, max) {
  min = Math.ceil(parseFloat(min));
  max = Math.floor(parseFloat(max));
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

factory.define('User', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

factory.define('Provider', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  provider: 1,
});

factory.define('Session', User, {
  email: faker.internet.email(),
  password: faker.internet.password(),
});

factory.define('Appointment', Appointment, {
  date: () => {
    const date = moment()
      .add(getRandomInt('0', '30'), 'days')
      .hours(getRandomInt(process.env.INITIAL_HOUR, process.env.FINAL_HOUR) + 1)
      .format('YYYY-MM-DD HH:MM:ss');
    return date;
  },
  canceled_att: null,
});

export default factory;

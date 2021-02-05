import * as Yup from 'yup';
import { ptShort } from 'yup-locale-pt';
import User from '../models/User';

Yup.setLocale(ptShort);
class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });
    if (!req) {
      return schema.fields(req.body);
    }

    if (!(await schema.isValid(req.body))) {
      try {
        await schema.validate(req.body);
      } catch (error) {
        return res.status(400).json({
          error: error.message,
          field: error.params.path,
        });
      }
    }

    const { email } = req.body;

    const checkEmail = await User.findOne({ where: { email } });

    if (checkEmail) {
      return res.status(400).json({ error: 'Duplicated email' });
    }

    const user = await User.create(req.body);
    return res.json(user);
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const checkEmail = await User.findOne({ where: { email } });

      if (checkEmail) {
        return res.status(400).json({ error: 'Duplicated email' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, name, email, provider });
  }
}

export default new UserController();

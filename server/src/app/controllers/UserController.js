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
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      oldPasswrod: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

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

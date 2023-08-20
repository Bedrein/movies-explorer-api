const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../utils/errors/NotFoundError');
const AuthError = require('../utils/errors/authError');
const BadRequestError = require('../utils/errors/badRequestError');
const NouniqueError = require('../utils/errors/NouniqueError');

const { JWT_SECRET, NODE_ENV } = process.env;

const createUser = (req, res, next) => {
  const {
    email, name, password,
  } = req.body;
  bcrypt.hash(String(password), 10)
    .then((hash) => User.create({
      email, name, password: hash,
    }))

    .then((user) => res.status(201).send({
      email: user.email,
      name: user.name,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
        return;
      }
      if (err.code === 11000) {
        next(new NouniqueError('При регистрации указан email, который уже существует'));
        return;
      }
      next(err);
    });
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
        return;
      }
      res.send(user);
    })
    .catch((err) => next(err));
};

function updateProfileInfo(req, res, next) {
  const { email, name } = req.body;
  const { _id } = req.user;

  User.findByIdAndUpdate(
    _id,
    { email, name },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
        return;
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
}

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthError('Неправильные почта или пароль');
          }

          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
            { expiresIn: '7d' },
          );
          res.send({ token });
        });
    })
    .catch(next);
};

module.exports = {
  createUser,
  getUserInfo,
  updateProfileInfo,
  login,
};

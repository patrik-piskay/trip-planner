import express from 'express';
import * as UserModel from '../models/User.js';
import auth from '../middleware/auth.js';
import { errorHandler500 } from '../utils/errorHandling.js';

const userRouter = express.Router();

userRouter.post('/users', (req, res) => {
  // create a new user

  try {
    const { username, name, password, role_id = UserModel.ROLE.USER } = req.body;

    const errors = {};

    if (!username?.trim()) {
      errors.username = 'field is required';
    }
    if (!name?.trim()) {
      errors.name = 'field is required';
    }
    if (!password?.trim()) {
      errors.password = 'field is required';
    }

    if (Object.keys(errors).length) {
      return res.status(400).send({ error: errors });
    }

    const user = UserModel.createUser({
      username,
      name,
      password,
      role_id,
    });

    res.status(201).send(UserModel.sanitizeUserObject(user));
  } catch (error) {
    errorHandler500(error, res);
  }
});

userRouter.get('/users', auth, (req, res) => {
  // get all users

  if (req.user.role_id === UserModel.ROLE.USER) {
    // forbidden
    return res.status(403).send();
  }

  try {
    const users = UserModel.getAllUsers();

    res.status(200).send(users.map(UserModel.sanitizeUserObject));
  } catch (error) {
    errorHandler500(error, res);
  }
});

userRouter.get('/users/:id', auth, (req, res) => {
  // get user profile

  const userId = req.params.id;

  if (req.user.id !== userId && req.user.role_id === UserModel.ROLE.USER) {
    // forbidden
    return res.status(403).send();
  }

  try {
    const user = UserModel.getUserById(userId);

    if (user) {
      res.status(200).send(UserModel.sanitizeUserObject(user));
    } else {
      res.status(404).send({ error: 'Not found' });
    }
  } catch (error) {
    errorHandler500(error, res);
  }
});

userRouter.patch('/users/:id', auth, (req, res) => {
  // edit user profile

  const userId = req.params.id;

  if (req.user.id !== userId && req.user.role_id === UserModel.ROLE.USER) {
    // forbidden
    return res.status(403).send();
  }

  const { name, password, role_id } = req.body;

  const errors = {};

  if (name && !name.trim()) {
    errors.name = 'field cannot be empty';
  }
  if (password && !password.trim()) {
    errors.password = 'field cannot be empty';
  }

  if (Object.keys(errors).length) {
    return res.status(400).send({ error: errors });
  }

  try {
    const user = UserModel.getUserById(userId);

    if (user.archived_at) {
      return res.status(404).send({ error: 'Not found' });
    }

    const updatedUser = UserModel.updateUser(userId, {
      name,
      password,
      role_id,
    });

    if (updatedUser) {
      res.status(200).send(UserModel.sanitizeUserObject(updatedUser));
    } else {
      res.status(404).send({ error: 'Not found' });
    }
  } catch (error) {
    errorHandler500(error, res);
  }
});

userRouter.delete('/users/:id', auth, (req, res) => {
  // delete user profile

  const userId = req.params.id;

  if (req.user.role_id === UserModel.ROLE.USER) {
    // forbidden
    return res.status(403).send();
  }

  try {
    const info = UserModel.deleteUser(userId);

    if (info.changes) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: 'Not found' });
    }
  } catch (error) {
    errorHandler500(error, res);
  }
});

export default userRouter;

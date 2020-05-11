import express from 'express';
import jwt from 'jsonwebtoken';
import EV from 'express-validator';
import * as UserModel from '../models/user.js';
import auth from '../middleware/auth.js';
import { catchErrors } from '../handlers/errorHandlers.js';

const userRouter = express.Router();

userRouter.post(
  '/users',
  [
    EV.check('username').trim().notEmpty().withMessage('field is required'),
    EV.check('password')
      .notEmpty()
      .withMessage('field is required')
      .bail()
      .isLength({ min: 6 })
      .withMessage('password needs to be at least 6 characters long'),
    EV.check('name').trim().notEmpty().withMessage('field is required'),
  ],
  catchErrors((req, res) => {
    // create a new user

    const validationErrors = EV.validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).send({ errors: validationErrors.array() });
    }

    const { username, name, password, role_id = UserModel.ROLE.USER } = req.body;

    let user;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const data = jwt.verify(token, process.env.JWT_KEY);
        user = UserModel.getUserById(data.userId);
      } catch (e) {}
    }

    if (role_id !== UserModel.ROLE.USER && user?.role_id !== UserModel.ROLE.ADMIN) {
      return res
        .status(403)
        .send({ error: 'Not authorized to create a user with advanced permission levels' });
    }

    const newUser = UserModel.createUser({
      username,
      name,
      password,
      role_id,
    });

    res.status(201).send(UserModel.sanitizeUserObject(newUser));
  }),
);

userRouter.get(
  '/users',
  auth,
  catchErrors((req, res) => {
    // get all users

    if (req.user.role_id === UserModel.ROLE.USER) {
      // forbidden
      return res.status(403).send();
    }

    const options = {};

    if (req.user.role_id === UserModel.ROLE.USER_MANAGER) {
      options.role_id = UserModel.ROLE.USER;
    }

    const users = UserModel.getAllUsers(options);

    res.status(200).send(users.map(UserModel.sanitizeUserObject));
  }),
);

userRouter.get(
  '/users/:id',
  auth,
  catchErrors((req, res) => {
    // get user profile

    const userId = req.params.id;

    if (req.user.id !== userId && req.user.role_id === UserModel.ROLE.USER) {
      // forbidden
      return res.status(403).send();
    }

    const user = UserModel.getUserById(userId);

    if (user) {
      if (req.user.role_id === UserModel.ROLE.USER_MANAGER) {
        if (req.user.id !== userId && user.role_id !== UserModel.ROLE.USER) {
          // forbidden
          return res.status(403).send();
        }
      }

      res.status(200).send(UserModel.sanitizeUserObject(user));
    } else {
      res.status(404).send({ error: 'Not found' });
    }
  }),
);

userRouter.patch(
  '/users/:id',
  auth,
  [
    EV.check('name').optional().trim().notEmpty().withMessage('field cannot be empty'),
    EV.check('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('password needs to be at least 6 characters long'),
  ],
  catchErrors((req, res) => {
    // edit user profile

    const validationErrors = EV.validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).send({ errors: validationErrors.array() });
    }

    const userId = req.params.id;
    const { name, password, role_id } = req.body;

    if (req.user.id !== userId && req.user.role_id === UserModel.ROLE.USER) {
      // forbidden
      return res.status(403).send();
    }

    const user = UserModel.getUserById(userId);

    if (!user || user.archived_at) {
      return res.status(404).send({ error: 'Not found' });
    }

    if (role_id && role_id !== user.role_id && ![UserModel.ROLE.ADMIN].includes(user.role_id)) {
      return res.status(403).send({ error: 'Not authorized to change user permission levels' });
    }

    if (req.user.role_id === UserModel.ROLE.USER_MANAGER) {
      if (req.user.id !== userId && user.role_id !== UserModel.ROLE.USER) {
        // forbidden
        return res.status(403).send();
      }
    }

    const updatedUser = UserModel.updateUser(userId, {
      name,
      password,
      role_id,
    });

    res.status(200).send(UserModel.sanitizeUserObject(updatedUser));
  }),
);

userRouter.delete(
  '/users/:id',
  auth,
  catchErrors((req, res) => {
    // delete user profile

    const userId = req.params.id;

    if (req.user.role_id === UserModel.ROLE.USER) {
      // forbidden
      return res.status(403).send();
    }

    if (req.user.id === userId) {
      // forbidden
      return res.status(403).send({ error: 'Cannot delete your own user' });
    }

    const user = UserModel.getUserById(userId);

    if (!user) {
      res.status(404).send({ error: 'Not found' });
    }

    if (req.user.role_id === UserModel.ROLE.USER_MANAGER) {
      if (user.role_id !== UserModel.ROLE.USER) {
        // forbidden
        return res.status(403).send();
      }
    }

    const info = UserModel.deleteUser(userId);

    if (info.changes) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: 'Not found' });
    }
  }),
);

export default userRouter;

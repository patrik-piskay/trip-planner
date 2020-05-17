import express from 'express';
import EV from 'express-validator';
import * as UserModel from '../models/user.js';
import auth from '../middleware/auth.js';
import { catchErrors } from '../handlers/errorHandlers.js';

const authRouter = express.Router();

authRouter.post('/auth', auth, (req, res) => {
  res.status(200).send(UserModel.sanitizeUserObject(req.user));
});

authRouter.post(
  '/auth/login',
  [
    EV.check('username').trim().notEmpty().withMessage('field is required'),
    EV.check('password').notEmpty().withMessage('field is required'),
  ],
  catchErrors((req, res) => {
    // login a registered user

    const validationErrors = EV.validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res.status(400).send({ errors: validationErrors.array() });
    }

    const { username, password } = req.body;
    const user = UserModel.findByCredentials(username, password);

    if (!user) {
      return res.status(403).send({ error: 'Invalid login credentials' });
    }

    const token = UserModel.generateAuthToken(user);

    res.status(200).send({ user: UserModel.sanitizeUserObject(user), token });
  }),
);

authRouter.post(
  '/auth/logout',
  auth,
  catchErrors((req, res) => {
    // log user out of the application

    const userTokens = JSON.parse(req.user.tokens);
    const newTokens = userTokens.filter((token) => {
      return token !== req.token;
    });

    UserModel.updateUser(req.user.id, {
      tokens: JSON.stringify(newTokens),
    });

    res.status(204).send({});
  }),
);

export default authRouter;

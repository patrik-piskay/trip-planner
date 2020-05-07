import express from 'express';
import * as UserModel from '../models/User.js';
import auth from '../middleware/auth.js';
import { errorHandler500 } from '../utils/errorHandling.js';

const authRouter = express.Router();

authRouter.post('/auth', auth, (req, res) => {
  res.status(200).send(UserModel.sanitizeUserObject(req.user));
});

authRouter.post('/auth/login', (req, res) => {
  // login a registered user

  try {
    const { username = '', password = '' } = req.body;
    const user = UserModel.findByCredentials(username, password);

    if (!user) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }

    const token = UserModel.generateAuthToken(user);

    res.status(200).send({ user: UserModel.sanitizeUserObject(user), token });
  } catch (error) {
    errorHandler500(error, res);
  }
});

authRouter.post('/auth/logout', auth, (req, res) => {
  // log user out of the application

  try {
    const userTokens = JSON.parse(req.user.tokens);
    const newTokens = userTokens.filter((token) => {
      return token !== req.token;
    });

    UserModel.updateUser(req.user.id, {
      tokens: JSON.stringify(newTokens),
    });

    res.send();
  } catch (error) {
    errorHandler500(error, res);
  }
});

export default authRouter;

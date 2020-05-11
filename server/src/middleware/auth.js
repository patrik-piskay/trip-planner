import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.js';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  try {
    const data = jwt.verify(token, process.env.JWT_KEY);
    const user = UserModel.getUserById(data.userId);

    if (!user) {
      throw new Error();
    }

    const userTokens = JSON.parse(user.tokens);

    if (!userTokens.includes(token)) {
      throw new Error();
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).send({ error: 'Not authorized to access this resource' });
  }
};

export default auth;

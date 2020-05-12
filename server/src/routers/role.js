import express from 'express';
import * as UserModel from '../models/user.js';
import auth from '../middleware/auth.js';
import { catchErrors } from '../handlers/errorHandlers.js';

const roleRouter = express.Router();

roleRouter.get(
  '/roles',
  auth,
  catchErrors((req, res) => {
    const roles = UserModel.getAllRoles();

    res.status(200).send(roles);
  }),
);

export default roleRouter;

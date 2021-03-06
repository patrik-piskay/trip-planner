import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import authRouter from './routers/auth.js';
import roleRouter from './routers/role.js';
import userRouter from './routers/user.js';
import tripRouter from './routers/trip.js';
import * as errorHandlers from './handlers/errorHandlers.js';

dotenv.config();
export const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(authRouter);
app.use(roleRouter);
app.use(userRouter);
app.use(tripRouter);

app.get('/ping', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

app.use(errorHandlers.notFound);
app.use(errorHandlers.errorHandler);

export default app;

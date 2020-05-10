import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routers/auth.js';
import userRouter from './routers/user.js';
import tripRouter from './routers/trip.js';
import * as errorHandlers from './handlers/errorHandlers.js';

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors());

app.use(authRouter);
app.use(userRouter);
app.use(tripRouter);

app.get('/ping', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

app.use(errorHandlers.notFound);

app.use(errorHandlers.errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

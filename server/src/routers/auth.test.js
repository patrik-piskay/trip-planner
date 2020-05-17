import test from 'ava';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import setup from '../../tests/setup.js';
import * as dummyData from '../../tests/db/dummyData.js';
import * as UserModel from '../models/user.js';

setup(test);

const user1token = JSON.parse(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547'].tokens)[0];
const userManagerToken = JSON.parse(
  dummyData.allUsers['b6769833-1cca-4d0b-a03c-b186169cc137'].tokens,
)[0];
const adminToken = JSON.parse(dummyData.allUsers['43ee6d85-1d50-4362-8c5f-258d55666e39'].tokens)[0];

test.serial('POST /auth - no token', async (t) => {
  const res = await t.context.server.post('/auth');

  t.is(res.status, 401);
  t.deepEqual(res.body, {
    error: 'Not authorized to access this resource',
  });
});

test.serial('POST /auth - invalid token', async (t) => {
  const res = await t.context.server.post('/auth').set({ Authorization: 'Bearer invalid_token' });

  t.is(res.status, 401);
  t.deepEqual(res.body, {
    error: 'Not authorized to access this resource',
  });
});

test.serial('POST /auth - valid token', async (t) => {
  const res = await t.context.server.post('/auth').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 200);
  t.deepEqual(
    res.body,
    _.omit(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547'], ['password', 'tokens']),
  );
});

test.serial('POST /auth/login - no data', async (t) => {
  const res = await t.context.server.post('/auth/login');

  t.is(res.status, 400);
  t.is(res.body.errors.length, 2);
});

test.serial('POST /auth/login - invalid credentials', async (t) => {
  const res = await t.context.server.post('/auth/login').send({
    username: '123',
    password: '123',
  });

  t.is(res.status, 403);
  t.is(res.body.error, 'Invalid login credentials');
});

test.serial('POST /auth/login - valid credentials', async (t) => {
  const userId = '3dade573-e975-4abf-a711-ba3338acf547';
  let user = UserModel.getUserById(userId);

  t.is(JSON.parse(user.tokens).length, 1);

  const res = await t.context.server.post('/auth/login').send({
    username: 'user1',
    password: 'pass123',
  });

  t.is(res.status, 200);
  t.deepEqual(
    res.body.user,
    _.omit(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547'], ['password', 'tokens']),
  );

  t.notThrows(() => {
    const token = jwt.verify(res.body.token, process.env.JWT_KEY);

    t.is(token.userId, userId);
  });

  user = UserModel.getUserById(userId);
  const tokens = JSON.parse(user.tokens);

  t.is(tokens.length, 2);
  t.is(tokens.includes(res.body.token), true);
});

test.serial('POST /auth/login - user deleted', async (t) => {
  const userId = '3dade573-e975-4abf-a711-ba3338acf547';
  let user = UserModel.getUserById(userId);

  t.is(user.archived_at, null);

  let res = await t.context.server.post('/auth/login').send({
    username: 'user1',
    password: 'pass123',
  });

  t.is(res.status, 200);

  UserModel.deleteUser(userId);
  user = UserModel.getUserById(userId);

  t.not(user.archived_at, null);

  res = await t.context.server.post('/auth/login').send({
    username: 'user1',
    password: 'pass123',
  });

  t.is(res.status, 403);
  t.is(res.body.error, 'Invalid login credentials');
});

test.serial('POST /auth/logout - no token', async (t) => {
  const res = await t.context.server.post('/auth/logout');

  t.is(res.status, 401);
  t.deepEqual(res.body, {
    error: 'Not authorized to access this resource',
  });
});

test.serial('POST /auth/logout - invalid token', async (t) => {
  const res = await t.context.server
    .post('/auth/logout')
    .set({ Authorization: 'Bearer invalid_token' });

  t.is(res.status, 401);
  t.deepEqual(res.body, {
    error: 'Not authorized to access this resource',
  });
});

test.serial('POST /auth/logout - valid token', async (t) => {
  const userId = '3dade573-e975-4abf-a711-ba3338acf547';
  let user = UserModel.getUserById(userId);

  t.is(JSON.parse(user.tokens).length, 1);

  const res = await t.context.server.post('/auth/logout').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 204);
  t.deepEqual(res.body, {});

  user = UserModel.getUserById(userId);
  t.is(JSON.parse(user.tokens).length, 0);
});

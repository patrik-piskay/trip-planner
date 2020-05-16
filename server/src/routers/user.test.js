import test from 'ava';
import validator from 'validator';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import setup from '../../tests/setup.js';
import * as UserModel from '../models/user.js';
import * as dummyData from '../../tests/db/dummyData.js';

setup(test);

const user1token = JSON.parse(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547'].tokens)[0];
const userManagerToken = JSON.parse(
  dummyData.allUsers['b6769833-1cca-4d0b-a03c-b186169cc137'].tokens,
)[0];
const adminToken = JSON.parse(dummyData.allUsers['43ee6d85-1d50-4362-8c5f-258d55666e39'].tokens)[0];

const sortCreatedDesc = (a, b) => (a.created_at < b.created_at ? 1 : -1);

test.serial('POST /users - invalid data', async (t) => {
  const res = await t.context.server.post('/users').send({
    username: '',
    password: '',
    name: '',
  });

  t.is(res.status, 400);
  t.is(res.body.errors.length, 3);
  res.body.errors.forEach((error) => {
    t.is(error.msg, 'field is required');
  });
});

test.serial('POST /users - invalid data 2', async (t) => {
  const res = await t.context.server.post('/users').send({
    username: 'username',
    password: '12345',
    name: 'name',
  });

  t.is(res.status, 400);
  t.is(res.body.errors.length, 1);
  t.deepEqual(res.body.errors[0].msg, 'password needs to be at least 6 characters long');
});

test.serial('POST /users - username already exists', async (t) => {
  const res = await t.context.server.post('/users').send({
    username: 'user1',
    password: '123456',
    name: 'name',
  });

  t.is(res.status, 409);
  t.is(res.body.error, 'Username is already taken');
});

test.serial('POST /users - resource created', async (t) => {
  const res = await t.context.server.post('/users').send({
    username: 'user3',
    password: 'pass123',
    name: 'User3 Name',
  });

  t.is(res.status, 201);
  t.is(validator.isUUID(res.body.id), true);
  t.deepEqual(_.omit(res.body, ['id', 'created_at']), {
    name: 'User3 Name',
    role_id: UserModel.ROLE.USER,
    username: 'user3',
    archived_at: null,
  });
  t.not(res.body.created_at, null);
});

test.serial('POST /users - advanced role - not authorized - no user', async (t) => {
  const res = await t.context.server.post('/users').send({
    username: 'user3',
    password: 'pass123',
    name: 'User3 Name',
    role_id: UserModel.ROLE.USER_MANAGER,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {
    error: 'Not authorized to create a user with advanced permission levels',
  });
});

test.serial('POST /users - advanced role - not authorized - regular user', async (t) => {
  const res = await t.context.server
    .post('/users')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      username: 'user3',
      password: 'pass123',
      name: 'User3 Name',
      role_id: UserModel.ROLE.USER_MANAGER,
    });

  t.is(res.status, 403);
  t.deepEqual(res.body, {
    error: 'Not authorized to create a user with advanced permission levels',
  });
});

test.serial('POST /users - advanced role - not authorized - user manager', async (t) => {
  const res = await t.context.server
    .post('/users')
    .set({
      Authorization: `Bearer ${userManagerToken}`,
    })
    .send({
      username: 'user3',
      password: 'pass123',
      name: 'User3 Name',
      role_id: UserModel.ROLE.USER_MANAGER,
    });

  t.is(res.status, 403);
  t.deepEqual(res.body, {
    error: 'Not authorized to create a user with advanced permission levels',
  });
});

test.serial('POST /users - advanced role - authorized - admin', async (t) => {
  const res = await t.context.server
    .post('/users')
    .set({
      Authorization: `Bearer ${adminToken}`,
    })
    .send({
      username: 'user3',
      password: 'pass123',
      name: 'User3 Name',
      role_id: UserModel.ROLE.USER_MANAGER,
    });

  t.is(res.status, 201);
  t.is(validator.isUUID(res.body.id), true);
  t.deepEqual(_.omit(res.body, ['id', 'created_at']), {
    name: 'User3 Name',
    role_id: UserModel.ROLE.USER_MANAGER,
    username: 'user3',
    archived_at: null,
  });
  t.not(res.body.created_at, null);
});

test.serial('GET /users - invalid token', async (t) => {
  const res = await t.context.server.get('/users').set({
    Authorization: 'Bearer invalid_token',
  });

  t.is(res.status, 401);
});

test.serial('GET /users - role USER', async (t) => {
  const res = await t.context.server.get('/users').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('GET /users - role USER MANAGER', async (t) => {
  const res = await t.context.server.get('/users').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 200);
  t.deepEqual(
    res.body,
    Object.values(dummyData.allUsers)
      .filter((user) => user.role_id === UserModel.ROLE.USER)
      .map(UserModel.sanitizeUserObject)
      .sort(sortCreatedDesc),
  );
});

test.serial('GET /users - role ADMIN', async (t) => {
  const res = await t.context.server.get('/users').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 200);

  t.deepEqual(
    res.body,
    Object.values(dummyData.allUsers).map(UserModel.sanitizeUserObject).sort(sortCreatedDesc),
  );
});

test.serial('GET /users/:id - invalid token', async (t) => {
  const res = await t.context.server.get('/users/3dade573-e975-4abf-a711-ba3338acf547').set({
    Authorization: 'Bearer invalid_token',
  });

  t.is(res.status, 401);
});

test.serial('GET /users/:id - 404', async (t) => {
  const res = await t.context.server.get('/users/404').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 404);
});

test.serial('GET /users/:id - role USER - owner', async (t) => {
  const res = await t.context.server.get('/users/3dade573-e975-4abf-a711-ba3338acf547').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 200);
  t.deepEqual(
    res.body,
    UserModel.sanitizeUserObject(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547']),
  );
});

test.serial('GET /users/:id - role USER - not the owner', async (t) => {
  const res = await t.context.server.get('/users/59ad5f8a-d284-47fa-a5d6-964ec0ba35fa').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('GET /users/:id - role USER MANAGER - user', async (t) => {
  const res = await t.context.server.get('/users/3dade573-e975-4abf-a711-ba3338acf547').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 200);
  t.deepEqual(
    res.body,
    UserModel.sanitizeUserObject(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547']),
  );
});

test.serial('GET /users/:id - role USER MANAGER - different user manager', async (t) => {
  const res = await t.context.server.get('/users/adbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('GET /users/:id - role ADMIN', async (t) => {
  const res = await t.context.server.get('/users/3dade573-e975-4abf-a711-ba3338acf547').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 200);

  t.deepEqual(
    res.body,
    UserModel.sanitizeUserObject(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547']),
  );
});

test.serial('PUT /users/:id - invalid token', async (t) => {
  const res = await t.context.server
    .put('/users/3dade573-e975-4abf-a711-ba3338acf547')
    .set({
      Authorization: 'Bearer invalid_token',
    })
    .send({});

  t.is(res.status, 401);
});

test.serial('PUT /users/:id - role USER - owner - incorrect data', async (t) => {
  const res = await t.context.server
    .put('/users/3dade573-e975-4abf-a711-ba3338acf547')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      name: '',
      password: '',
    });

  t.is(res.status, 400);
  t.is(res.body.errors.length, 2);
});

test.serial('PUT /users/:id - role USER - owner - incorrect data 2', async (t) => {
  const res = await t.context.server
    .put('/users/3dade573-e975-4abf-a711-ba3338acf547')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      password: '12345',
    });

  t.is(res.status, 400);
  t.is(res.body.errors.length, 1);
  t.deepEqual(res.body.errors[0].msg, 'password needs to be at least 6 characters long');
});

test.serial('PUT /users/:id - role USER - owner - correct data', async (t) => {
  const res = await t.context.server
    .put('/users/3dade573-e975-4abf-a711-ba3338acf547')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      name: 'User 1 Name edited',
      password: 'pass123-edited',
    });

  t.is(res.status, 200);
  t.deepEqual(res.body, {
    ...UserModel.sanitizeUserObject(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547']),
    name: 'User 1 Name edited',
  });

  const dbUser = UserModel.getUserById('3dade573-e975-4abf-a711-ba3338acf547');
  t.is(bcrypt.compareSync('pass123-edited', dbUser.password), true);
});

test.serial('PUT /users/:id - role USER - not the owner', async (t) => {
  const res = await t.context.server
    .put('/users/59ad5f8a-d284-47fa-a5d6-964ec0ba35fa')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      name: 'User 2 Name edited',
      password: 'pass123-edited',
    });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('PUT /users/:id - role USER MANAGER - user', async (t) => {
  const res = await t.context.server
    .put('/users/3dade573-e975-4abf-a711-ba3338acf547')
    .set({
      Authorization: `Bearer ${userManagerToken}`,
    })
    .send({
      name: 'User 1 Name edited',
      password: 'pass123-edited',
    });

  t.is(res.status, 200);
  t.deepEqual(res.body, {
    ...UserModel.sanitizeUserObject(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547']),
    name: 'User 1 Name edited',
  });

  const dbUser = UserModel.getUserById('3dade573-e975-4abf-a711-ba3338acf547');
  t.is(bcrypt.compareSync('pass123-edited', dbUser.password), true);
});

test.serial('PUT /users/:id - role USER MANAGER - manager', async (t) => {
  const res = await t.context.server
    .put('/users/adbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: `Bearer ${userManagerToken}`,
    })
    .send({
      name: 'User Manager 2 Name edited',
      password: 'pass123-edited',
    });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('PUT /users/:id - role ADMIN', async (t) => {
  const res = await t.context.server
    .put('/users/adbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: `Bearer ${adminToken}`,
    })
    .send({
      name: 'User Manager 2 Name edited',
      password: 'pass123-edited',
    });

  t.is(res.status, 200);
  t.deepEqual(res.body, {
    ...UserModel.sanitizeUserObject(dummyData.allUsers['adbee3b8-44bd-4250-bb83-bd06e90427a9']),
    name: 'User Manager 2 Name edited',
  });

  const dbUser = UserModel.getUserById('adbee3b8-44bd-4250-bb83-bd06e90427a9');
  t.is(bcrypt.compareSync('pass123-edited', dbUser.password), true);
});

test.serial('DELETE /users/:id - invalid token', async (t) => {
  const res = await t.context.server
    .delete('/users/3dade573-e975-4abf-a711-ba3338acf547')
    .set({
      Authorization: 'Bearer invalid_token',
    })
    .send({});

  t.is(res.status, 401);
});

test.serial('DELETE /users/:id - 404', async (t) => {
  const res = await t.context.server
    .delete('/users/404')
    .set({
      Authorization: `Bearer ${userManagerToken}`,
    })
    .send({});

  t.is(res.status, 404);
});

test.serial('DELETE /users/:id - role USER - owner', async (t) => {
  const res = await t.context.server.delete('/users/3dade573-e975-4abf-a711-ba3338acf547').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /users/:id - role USER - not the owner', async (t) => {
  const res = await t.context.server.delete('/users/59ad5f8a-d284-47fa-a5d6-964ec0ba35fa').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /users/:id - role USER MANAGER - user', async (t) => {
  const res = await t.context.server.delete('/users/3dade573-e975-4abf-a711-ba3338acf547').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 204);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /users/:id - role USER MANAGER - self', async (t) => {
  const res = await t.context.server.delete('/users/b6769833-1cca-4d0b-a03c-b186169cc137').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {
    error: 'Cannot delete your own user',
  });
});

test.serial('DELETE /users/:id - role USER MANAGER - another manager', async (t) => {
  const res = await t.context.server.delete('/users/adbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /users/:id - role ADMIN - user', async (t) => {
  const res = await t.context.server.delete('/users/3dade573-e975-4abf-a711-ba3338acf547').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 204);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /users/:id - role ADMIN - manager', async (t) => {
  const res = await t.context.server.delete('/users/adbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 204);

  t.deepEqual(res.body, {});
});

test.serial('DELETE /users/:id - role ADMIN - self', async (t) => {
  const res = await t.context.server.delete('/users/43ee6d85-1d50-4362-8c5f-258d55666e39').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {
    error: 'Cannot delete your own user',
  });
});

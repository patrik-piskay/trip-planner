import test from 'ava';
import validator from 'validator';
import _ from 'lodash';
import setup from '../../tests/setup.js';
import * as dummyData from '../../tests/db/dummyData.js';

setup(test);

const user1token = JSON.parse(dummyData.allUsers['3dade573-e975-4abf-a711-ba3338acf547'].tokens)[0];
const userManagerToken = JSON.parse(
  dummyData.allUsers['b6769833-1cca-4d0b-a03c-b186169cc137'].tokens,
)[0];
const adminToken = JSON.parse(dummyData.allUsers['43ee6d85-1d50-4362-8c5f-258d55666e39'].tokens)[0];

const sortCreatedDesc = (a, b) => (a.created_at < b.created_at ? 1 : -1);

test.serial('POST /trips - no token', async (t) => {
  const res = await t.context.server.post('/trips');

  t.is(res.status, 401);
  t.deepEqual(res.body, {
    error: 'Not authorized to access this resource',
  });
});

test.serial('POST /trips - invalid input data', async (t) => {
  const res = await t.context.server
    .post('/trips')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({});

  t.is(res.status, 400);
  t.is(res.body.errors.length, 3);
  res.body.errors.forEach((error) => {
    t.is(error.msg, 'field is required');
  });
});

test.serial('POST /trips - invalid data 2', async (t) => {
  const res = await t.context.server
    .post('/trips')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      destination: '',
      start_date: '',
      end_date: '',
      comment: '',
    });

  t.is(res.status, 400);
  t.is(res.body.errors.length, 3);
  res.body.errors.forEach((error) => {
    t.is(error.msg, 'field is required');
  });
});

test.serial('POST /trips - resource created', async (t) => {
  const res = await t.context.server
    .post('/trips')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      destination: 'London',
      start_date: '2020/01/01',
      end_date: '2020/12/31',
      comment: 'Comment',
    });

  t.is(res.status, 201);
  t.is(validator.isUUID(res.body.id), true);
  t.deepEqual(_.omit(res.body, ['id', 'created_at']), {
    user_id: '3dade573-e975-4abf-a711-ba3338acf547',
    destination: 'London',
    start_date: '2020/01/01',
    end_date: '2020/12/31',
    comment: 'Comment',
    archived_at: null,
  });
  t.not(res.body.created_at, null);
});

test.serial('GET /trips - invalid token', async (t) => {
  const res = await t.context.server.get('/trips').set({
    Authorization: 'Bearer invalid_token',
  });

  t.is(res.status, 401);
});

test.serial('GET /trips - role USER', async (t) => {
  const res = await t.context.server.get('/trips').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 200);
  t.deepEqual(
    res.body,
    Object.values(dummyData.allTrips)
      .filter((trip) => trip.user_id === '3dade573-e975-4abf-a711-ba3338acf547')
      .sort(sortCreatedDesc),
  );
});

test.serial('GET /trips - role USER MANAGER', async (t) => {
  const res = await t.context.server.get('/trips').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('GET /trips - role ADMIN', async (t) => {
  const res = await t.context.server.get('/trips').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 200);

  t.deepEqual(res.body, Object.values(dummyData.allTrips).sort(sortCreatedDesc));
});

test.serial('GET /trips/:id - invalid token', async (t) => {
  const res = await t.context.server.get('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: 'Bearer invalid_token',
  });

  t.is(res.status, 401);
});

test.serial('GET /trips/:id - 404', async (t) => {
  const res = await t.context.server.get('/trips/404').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 404);
});

test.serial('GET /trips/:id - role USER - owner', async (t) => {
  const res = await t.context.server.get('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 200);
  t.deepEqual(res.body, dummyData.allTrips['fdbee3b8-44bd-4250-bb83-bd06e90427a9']);
});

test.serial('GET /trips/:id - role USER - not the owner', async (t) => {
  const res = await t.context.server.get('/trips/1c29b408-8e9e-4061-b172-6dad36afcd66').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('GET /trips/:id - role USER MANAGER', async (t) => {
  const res = await t.context.server.get('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('GET /trips/:id - role ADMIN', async (t) => {
  const res = await t.context.server.get('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 200);

  t.deepEqual(res.body, dummyData.allTrips['fdbee3b8-44bd-4250-bb83-bd06e90427a9']);
});

test.serial('PATCH /trips/:id - invalid token', async (t) => {
  const res = await t.context.server
    .patch('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: 'Bearer invalid_token',
    })
    .send({});

  t.is(res.status, 401);
});

test.serial('PATCH /trips/:id - 404', async (t) => {
  const res = await t.context.server
    .patch('/trips/404')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({});

  t.is(res.status, 404);
});

test.serial('PATCH /trips/:id - role USER - owner - incorrect data', async (t) => {
  const res = await t.context.server
    .patch('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      destination: '',
      start_date: '',
      end_date: '',
      comment: '',
    });

  t.is(res.status, 400);
  t.is(res.body.errors.length, 3);
});

test.serial('PATCH /trips/:id - role USER - owner - correct data', async (t) => {
  const res = await t.context.server
    .patch('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      destination: 'destination edited',
      start_date: '2030/01/01',
      end_date: '2030/01/01',
      comment: 'comment edited',
    });

  t.is(res.status, 200);
  t.deepEqual(res.body, {
    ...dummyData.allTrips['fdbee3b8-44bd-4250-bb83-bd06e90427a9'],
    destination: 'destination edited',
    start_date: '2030/01/01',
    end_date: '2030/01/01',
    comment: 'comment edited',
  });
});

test.serial('PATCH /trips/:id - role USER - not the owner', async (t) => {
  const res = await t.context.server
    .patch('/trips/1c29b408-8e9e-4061-b172-6dad36afcd66')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({
      destination: 'destination edited',
      start_date: '2030/01/01',
      end_date: '2030/01/01',
      comment: 'comment edited',
    });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('PATCH /trips/:id - role USER MANAGER', async (t) => {
  const res = await t.context.server
    .patch('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: `Bearer ${userManagerToken}`,
    })
    .send({
      destination: 'destination edited',
      start_date: '2030/01/01',
      end_date: '2030/01/01',
      comment: 'comment edited',
    });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('PATCH /trips/:id - role ADMIN', async (t) => {
  const res = await t.context.server
    .patch('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: `Bearer ${adminToken}`,
    })
    .send({
      destination: 'destination edited',
      start_date: '2030/01/01',
      end_date: '2030/01/01',
      comment: 'comment edited',
    });

  t.is(res.status, 200);

  t.deepEqual(res.body, {
    ...dummyData.allTrips['fdbee3b8-44bd-4250-bb83-bd06e90427a9'],
    destination: 'destination edited',
    start_date: '2030/01/01',
    end_date: '2030/01/01',
    comment: 'comment edited',
  });
});

test.serial('DELETE /trips/:id - invalid token', async (t) => {
  const res = await t.context.server
    .delete('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9')
    .set({
      Authorization: 'Bearer invalid_token',
    })
    .send({});

  t.is(res.status, 401);
});

test.serial('DELETE /trips/:id - 404', async (t) => {
  const res = await t.context.server
    .delete('/trips/404')
    .set({
      Authorization: `Bearer ${user1token}`,
    })
    .send({});

  t.is(res.status, 404);
});

test.serial('DELETE /trips/:id - role USER - owner', async (t) => {
  const res = await t.context.server.delete('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 204);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /trips/:id - role USER - not the owner', async (t) => {
  const res = await t.context.server.delete('/trips/1c29b408-8e9e-4061-b172-6dad36afcd66').set({
    Authorization: `Bearer ${user1token}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /trips/:id - role USER MANAGER', async (t) => {
  const res = await t.context.server.delete('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${userManagerToken}`,
  });

  t.is(res.status, 403);
  t.deepEqual(res.body, {});
});

test.serial('DELETE /trips/:id - role ADMIN', async (t) => {
  const res = await t.context.server.delete('/trips/fdbee3b8-44bd-4250-bb83-bd06e90427a9').set({
    Authorization: `Bearer ${adminToken}`,
  });

  t.is(res.status, 204);

  t.deepEqual(res.body, {});
});

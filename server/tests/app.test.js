import test from 'ava';
import setup from './setup.js';

setup(test);

test.serial('GET /ping', async (t) => {
  const res = await t.context.server.get('/ping');
  t.is(res.status, 200);
  t.deepEqual(res.body, {
    status: 'ok',
  });
});

test.serial('GET /404', async (t) => {
  const res = await t.context.server.get('/not-found-route');
  t.is(res.status, 404);
  t.deepEqual(res.body, {
    error: 'Endpoint not found',
  });
});

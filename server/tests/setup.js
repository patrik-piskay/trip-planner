import supertest from 'supertest';
import app from '../src/index.js';
import { refreshDbConnection } from '../src/db/db.js';
import { populateDb, deleteDb } from '../tests/db/index.js';

export default function setup(test) {
  test.before(async (t) => {
    t.context.server = await supertest(app);
  });

  test.beforeEach(async (t) => {
    await populateDb();

    refreshDbConnection();
  });

  test.afterEach.always(async (t) => {
    await deleteDb();
  });

  test.after.always(async (t) => {
    t.context.server = null;
  });
}

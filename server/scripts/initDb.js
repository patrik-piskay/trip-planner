import { queryRun } from '../src/db/db.js';

queryRun('BEGIN');

try {
  queryRun(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    password TEXT,
    tokens TEXT,
    role_id INTEGER,
    created_at DATETIME DEFAULT (strftime('%s', 'now')),
    archived_at DATETIME DEFAULT NULL,
    FOREIGN KEY (role_id) REFERENCES user_roles (id) 
  );
  `);

  queryRun(`CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  );`);

  queryRun(`INSERT INTO user_roles (name) VALUES ('User');`);
  queryRun(`INSERT INTO user_roles (name) VALUES ('User manager');`);
  queryRun(`INSERT INTO user_roles (name) VALUES ('Admin');`);

  queryRun(`CREATE TABLE trips (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    destination TEXT,
    start_date TEXT,
    end_date TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT (strftime('%s', 'now')),
    archived_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) 
  );
  `);

  queryRun('COMMIT');
} catch (e) {
  queryRun('ROLLBACK');

  throw e;
}

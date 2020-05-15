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

  queryRun(
    `INSERT INTO users (id, username, password, name, role_id, tokens) VALUES ('8c0e5937-8c52-4f54-a3d3-f15652873bf7', 'admin', '$2a$08$l0WQbrswY4MiqGjIFPru/u2bNSDMdxAvaAFwa6ADUlAz522LouUPu', 'Admin', 3, '[]');`,
  );

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

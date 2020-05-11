import sqlite3 from 'better-sqlite3';

export const dbFilePath = process.env.NODE_ENV !== 'test' ? 'db.sqlite' : 'tests/test-db.sqlite';
let db = sqlite3(dbFilePath);

// for testing only
export function refreshDbConnection() {
  db = sqlite3(dbFilePath);
}

export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

export function queryRun(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

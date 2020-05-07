import sqlite3 from 'better-sqlite3';

const db = sqlite3('db.sqlite');

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

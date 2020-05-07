import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { queryOne, queryRun, queryAll } from '../db/db.js';

export const ROLE = {
  USER: 1,
  USER_MANAGER: 2,
  ADMIN: 3,
};

export function sanitizeUserObject(user) {
  delete user.password;
  delete user.tokens;

  return user;
}

export function getUserById(id) {
  return queryOne('SELECT * FROM users WHERE id = ?', [id]);
}

export function findByCredentials(username, password) {
  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) {
    return null;
  }

  if (!bcrypt.compare(password, user.password)) {
    return null;
  }

  return user;
}

export function generateAuthToken(user) {
  const newToken = jwt.sign({ userId: user.id }, process.env.JWT_KEY);

  const tokens = JSON.parse(user.tokens).concat(newToken);

  queryRun('UPDATE users SET tokens = ? WHERE id = ?', [JSON.stringify(tokens), user.id]);

  return newToken;
}

export function createUser(userData) {
  const newUserId = uuid();

  queryRun('BEGIN');

  try {
    queryRun(
      'INSERT INTO users (id, username, name, password, role_id, tokens) VALUES (?, ?, ?, ?, ?, ?)',
      [
        newUserId,
        userData.username,
        userData.name,
        bcrypt.hashSync(userData.password, 8),
        userData.role_id,
        JSON.stringify([]),
      ],
    );

    queryRun('COMMIT');
  } catch (error) {
    queryRun('ROLLBACK');

    throw error;
  }

  const user = getUserById(newUserId);

  return user;
}

export function updateUser(userId, userData) {
  const toUpdate = Object.keys(userData).reduce(
    (toUpdate, column) => {
      if (typeof userData[column] !== 'undefined' && userData[column] !== null) {
        toUpdate.columns.push(column);
        toUpdate.values.push(userData[column]);
      }

      return toUpdate;
    },
    { columns: [], values: [] },
  );

  if (toUpdate.columns.length) {
    queryRun(
      `UPDATE users SET ${toUpdate.columns
        .map((column) => `${column} = ?`)
        .join(', ')} WHERE id = ?`,
      [...toUpdate.values, userId],
    );
  }

  const user = getUserById(userId);

  return user;
}

export function deleteUser(userId) {
  return queryRun(`UPDATE users SET archived_at = strftime('%s', 'now') WHERE id = ?`, [userId]);
}

export function getAllUsers() {
  return queryAll(`SELECT * FROM users WHERE archived_at IS NULL ORDER BY created_at DESC`);
}

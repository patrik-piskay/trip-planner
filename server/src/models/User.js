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
  const copyUser = { ...user };
  delete copyUser.password;
  delete copyUser.tokens;

  return copyUser;
}

export function getUserById(id) {
  return queryOne('SELECT * FROM users WHERE id = ?', [id]);
}

export function getUserByUsername(username) {
  return queryOne('SELECT * FROM users WHERE username = ?', [username]);
}

export function getAllRoles(id) {
  return queryAll('SELECT * FROM user_roles');
}

export function findByCredentials(username, password) {
  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) {
    return null;
  }

  if (!bcrypt.compareSync(password, user.password)) {
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

        if (column === 'password') {
          toUpdate.values.push(bcrypt.hashSync(userData.password, 8));
        } else {
          toUpdate.values.push(userData[column]);
        }
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
  return queryRun(
    `UPDATE users SET archived_at = strftime('%s', 'now') WHERE id = ? AND archived_at IS NULL`,
    [userId],
  );
}

export function getAllUsers(whereOpts) {
  const where = Object.entries(whereOpts)
    .map(([column, value]) => {
      return `${column} = ?`;
    })
    .join(' AND ');

  return queryAll(
    `SELECT * FROM users WHERE archived_at IS NULL ${where && `AND ${where}`}
  ORDER BY created_at DESC`,
    [...Object.values(whereOpts)],
  );
}

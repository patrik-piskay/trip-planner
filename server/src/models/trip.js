import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { queryOne, queryRun, queryAll } from '../db/db.js';

export function getTripById(id) {
  return queryOne('SELECT * FROM trips WHERE id = ?', [id]);
}

export function createTrip(tripData) {
  const newTripId = uuid();

  queryRun(
    'INSERT INTO trips (id, user_id, destination, start_date, end_date, comment) VALUES (?, ?, ?, ?, ?, ?)',
    [
      newTripId,
      tripData.user_id,
      tripData.destination,
      tripData.start_date,
      tripData.end_date,
      tripData.comment,
    ],
  );

  return getTripById(newTripId);
}

export function updateTrip(tripId, tripData) {
  const toUpdate = Object.keys(tripData).reduce(
    (toUpdate, column) => {
      if (typeof tripData[column] !== 'undefined' && tripData[column] !== null) {
        toUpdate.columns.push(column);

        toUpdate.values.push(tripData[column]);
      }

      return toUpdate;
    },
    { columns: [], values: [] },
  );

  if (toUpdate.columns.length) {
    queryRun(
      `UPDATE trips SET ${toUpdate.columns
        .map((column) => `${column} = ?`)
        .join(', ')} WHERE id = ?`,
      [...toUpdate.values, tripId],
    );
  }

  return getTripById(tripId);
}

export function deleteTrip(tripId) {
  return queryRun(
    `UPDATE trips SET archived_at = strftime('%s', 'now') WHERE id = ? AND archived_at IS NULL`,
    [tripId],
  );
}

export function getAllTrips(whereOpts) {
  const where = Object.entries(whereOpts)
    .map(([column, value]) => {
      return `${column} = ?`;
    })
    .join(' AND ');

  return queryAll(
    `SELECT * FROM trips WHERE archived_at IS NULL ${where && `AND ${where}`}
  ORDER BY created_at DESC`,
    [...Object.values(whereOpts)],
  );
}

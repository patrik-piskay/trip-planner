import { exec } from 'child_process';
import { queryRun, dbFilePath, refreshDbConnection } from '../../src/db/db.js';
import { userData, tripData } from './dummyData.js';

export function populateDb() {
  return new Promise((resolve, reject) => {
    exec(`sqlite3 ${dbFilePath} < tests/db/dump.sql`, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error('populateDb schema error', error || stderr);
        reject();
      }

      try {
        refreshDbConnection();

        userData.forEach((user) => {
          queryRun('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)', [...user]);
        });

        tripData.forEach((trip) => {
          queryRun('INSERT INTO trips VALUES(?,?,?,?,?,?,?,?)', [...trip]);
        });

        resolve();
      } catch (e) {
        console.error('populateDb data error', e);

        reject();
      }
    });
  });
}

export function deleteDb() {
  return new Promise((resolve, reject) => {
    exec(`rm ${dbFilePath}`, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error('deleteDb error', error || stderr);
        reject();
      }

      resolve();
    });
  });
}

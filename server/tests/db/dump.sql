PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
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
-- INSERT INTO users VALUES('3dade573-e975-4abf-a711-ba3338acf547','user1','User1 Name','$2a$08$33H4z7QE7siVxejnn53EtOXLQeN.PeMNnWUtzO82OCtyfJ89PxFZ.','["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZGFkZTU3My1lOTc1LTRhYmYtYTcxMS1iYTMzMzhhY2Y1NDciLCJpYXQiOjE1ODkwOTM0MTB9.ctPN1EpMdezn1K51B_fu8B93oDaH1MOz2uZbWYNhiwg"]',1,1589093275,NULL);
-- INSERT INTO users VALUES('59ad5f8a-d284-47fa-a5d6-964ec0ba35fa','user2','User2 Name','$2a$08$7UPdRhPwEp4Re1oInfmVw.qggG88dadrRtY0RdqaSPs4q9/2Jyuem','["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1OWFkNWY4YS1kMjg0LTQ3ZmEtYTVkNi05NjRlYzBiYTM1ZmEiLCJpYXQiOjE1ODkwOTM0MTN9.BYcvFRKrrr3pPZa5f_e7aYLiVRXZVR2HEmr7QlTgAU4"]',1,1589093281,NULL);
-- INSERT INTO users VALUES('b6769833-1cca-4d0b-a03c-b186169cc137','user-manager','User Manager Name','$2a$08$mOgS0syHSkj.Ct1JUarkQuYG/UzYPr48I8t4tyJL5wLK9PI7vqX4u','["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNjc2OTgzMy0xY2NhLTRkMGItYTAzYy1iMTg2MTY5Y2MxMzciLCJpYXQiOjE1ODkwOTM0MTl9.FWdcx6AkNIjz6LfEGhvOjJL7mUg2hePy-2IKAdIpIvc"]',2,1589093354,NULL);
-- INSERT INTO users VALUES('43ee6d85-1d50-4362-8c5f-258d55666e39','admin','Admin Name','$2a$08$sK4/3zQATaR7pYvucYUbJue12lsWld.Oh6f0yHKrKJGU6TS8xb0p2','["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0M2VlNmQ4NS0xZDUwLTQzNjItOGM1Zi0yNThkNTU2NjZlMzkiLCJpYXQiOjE1ODkwOTM0MjN9.D5eYmz-upYijTakTBewzVWZ08zw8lpZaRSqw-968pMY"]',3,1589093368,NULL);
CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  );
INSERT INTO user_roles VALUES(1,'User');
INSERT INTO user_roles VALUES(2,'User manager');
INSERT INTO user_roles VALUES(3,'Admin');
CREATE TABLE trips (
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
-- INSERT INTO trips VALUES('fdbee3b8-44bd-4250-bb83-bd06e90427a9','3dade573-e975-4abf-a711-ba3338acf547','London','2020/07/01','2020/07/08','Let''s go!',1589093833,NULL);
-- INSERT INTO trips VALUES('bbac4641-92fc-4ed3-a25e-94448547208d','3dade573-e975-4abf-a711-ba3338acf547','Prague','2020/08/01','2020/08/31','Let''s go!',1589093852,NULL);
-- INSERT INTO trips VALUES('1c29b408-8e9e-4061-b172-6dad36afcd66','59ad5f8a-d284-47fa-a5d6-964ec0ba35fa','Paris','2020/08/01','2020/08/16','Let''s go!',1589093887,NULL);
-- DELETE FROM sqlite_sequence;
-- INSERT INTO sqlite_sequence VALUES('user_roles',3);
COMMIT;

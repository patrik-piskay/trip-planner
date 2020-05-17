# Travel plans server

This is an Express Node.js server using a local SQLite database for data persistance.

## Environment variables

`PORT` and `JWT_KEY` environment variables are required for the server to run properly.

Their default values are specified in `.env` file:

```
PORT=8000              # port on which the server is running
JWT_KEY="toptal-demo"  # key used to generate authentication tokens
```

## Getting started

For the initial setup, initialize the database by running:

```bash
npm run bootstrapDb
# or
yarn bootstrapDb
```

This will remove the old database (if there is one) and will create a new one, with pre-entered user roles data and one user:

```
[role: admin]
username: admin
password: pass123
```

Once the database is set up, run the server in development by running:

```bash
npm start
# or
yarn start
```

To run the server in production, run:

```bash
NODE_ENV=production node src/index.js
```

Both will start a server on port that was specified in the `PORT` environment variable.

To run tests, run:

```
npm run test
# or
yarn test
```

---

## API documentation

To verify the server is running correcty:

```
GET /ping
```

---

### Models

Role

```
id: number
name: string
```

User

```
id: string
role_id: number,
name: string,
username: string,
created_at: number,
archived_at: number
```

Trip

```
id: string
user_id: string,
destination: string,
start_date: string(YYYY/MM/DD),
end_date: string(YYYY/MM/DD),
created_at: number,
archived_at: number
```

---

## Auth

To retrieve the auth token, user first needs to log in:

### POST /auth/login

Params:

```
username: string
password: string
```

Result:

```
200 {
  user: User,
  token: string
}
```

Once the token is retrieved, all subsequent requests that are available only to authenticated users need to send the following header:

```
Authorization: Bearer {token}
```

---

### POST /auth/logout

_[auth header required]_

Result:

```
204
```

---

### POST /auth

_[auth header required]_

Result:

```
200 User
```

---

---

## Roles

### GET /roles

Result:

```
200 Role[]
```

---

---

## Users

### POST /users

Params:

```
username: string,
password: string(6,)
name: string,
role_id?: RoleId
```

Result:

```
201 User
```

---

### GET /users

_[auth header required]_

Result:

```
200 User[]
```

---

### GET /users/:id

_[auth header required]_

Result:

```
200 User
```

---

### PUT /users/:id

_[auth header required]_

Params:

```
password?: string(6,)
name?: string,
```

Result:

```
200 User
```

---

### DELETE /users/:id

_[auth header required]_

Result:

```
204
```

---

---

## Trips

### POST /trips

_[auth header required]_

Params:

```
destination: string,
start_date: string(YYYY/MM/DD)
end_date: string(YYYY/MM/DD),
comment?: string
```

Result:

```
201 Trip
```

---

### GET /trips

_[auth header required]_

Result:

```
200 Trip[]
```

---

### GET /trips/:id

_[auth header required]_

Result:

```
200 Trip
```

---

### PUT /trips/:id

_[auth header required]_

Params:

```
destination?: string,
start_date?: string(YYYY/MM/DD)
end_date?: string(YYYY/MM/DD),
comment?: string
```

Result:

```
200 Trip
```

---

### DELETE /trips/:id

_[auth header required]_

Result:

```
204
```

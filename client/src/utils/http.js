import Router from 'next/router';
import { getAuthToken, setAuthToken } from './auth';

const customFetch = (path, opts) => {
  const token = getAuthToken();
  const headers = {
    'content-type': 'application/json',
    accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`http://localhost:8000${path}`, {
    method: opts.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
    .then((response) => {
      if (response.ok) {
        return response;
      } else {
        if (response.status === 401) {
          setAuthToken('');
          Router.push('/login');
        }

        throw response;
      }
    })
    .then((response) => {
      if (response.status === 204) {
        return;
      }

      return response.json();
    });
};

export default {
  get(path, opts) {
    return customFetch(path, {
      ...opts,
      method: 'GET',
    });
  },
  post(path, opts) {
    return customFetch(path, {
      ...opts,
      method: 'POST',
    });
  },
  put(path, opts) {
    return customFetch(path, {
      ...opts,
      method: 'PUT',
    });
  },
  delete(path, opts) {
    return customFetch(path, {
      ...opts,
      method: 'DELETE',
    });
  },
};

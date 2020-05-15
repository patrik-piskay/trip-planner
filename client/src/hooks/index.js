import { useContext } from 'react';
import { useQuery, queryCache } from 'react-query';
import { StateContext } from '../contexts/state';
import http from '../utils/http';
import { ROLE } from '../constants';

export function useGetUsers() {
  const {
    state: { user },
  } = useContext(StateContext);

  const shouldFetchUsers = [ROLE.USER_MANAGER, ROLE.ADMIN].includes(user.role_id);

  const { data: users } = useQuery(shouldFetchUsers && 'users', () => http.get('/users'), {
    cacheTime: Infinity,
    initialData: shouldFetchUsers ? queryCache.getQueryData('users') : [],
  });

  return users;
}

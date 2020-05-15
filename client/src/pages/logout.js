import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { queryCache } from 'react-query';

import { setAuthToken } from '../utils/auth';
import http from '../utils/http';
import { StateContext, initialState } from '../contexts/state';

function Logout(props) {
  const { setAppState } = useContext(StateContext);
  const router = useRouter();

  useEffect(() => {
    http.post('/auth/logout');

    setAuthToken('');
    setAppState(initialState);
    queryCache.clear();
    router.push('/login');
  }, []);

  return null;
}

export default Logout;

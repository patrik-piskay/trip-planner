import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

import withAuth from '../components/withAuth';
import { setAuthToken } from '../utils/auth';
import http from '../utils/http';
import { StateContext, initialState } from '../contexts/state';

function Logout(props) {
  const { setAppState } = useContext(StateContext);
  const router = useRouter();

  useEffect(() => {
    http.post('/auth/logout').then(() => {
      setAuthToken('');
      setAppState(initialState);
      router.push('/');
    });
  }, [setAppState, router]);

  return <div />;
}

export default withAuth(Logout);

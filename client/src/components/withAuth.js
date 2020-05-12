import React, { useState, useEffect, useContext, useCallback } from 'react';
import http from '../utils/http';
import { StateContext } from '../contexts/state';

export default function withAuth(Component) {
  return (props) => {
    const [didInit, setDidInit] = useState(false);
    const { state, setAppState } = useContext(StateContext);

    const bootstrap = useCallback(async () => {
      const user = await http.post('/auth');
      const roles = await http.get('/roles');

      setAppState({
        user,
        roles,
      });

      setDidInit(true);
    }, [setAppState]);

    useEffect(() => {
      if (state.user !== null) {
        setDidInit(true);
      } else {
        bootstrap();
      }
    }, [state.user, bootstrap]);

    if (!didInit) {
      return null;
    }

    return <Component {...props} />;
  };
}

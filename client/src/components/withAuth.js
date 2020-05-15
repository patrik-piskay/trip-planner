import React, { useState, useEffect, useContext } from 'react';
import { useToast, Spinner, Box } from '@chakra-ui/core';
import { queryCache } from 'react-query';
import http from '../utils/http';
import { StateContext } from '../contexts/state';
import { ROLE } from '../constants';
import Layout from './Layout';

export default function withAuth(Component) {
  return (props) => {
    const { state, setAppState } = useContext(StateContext);
    const [didInit, setDidInit] = useState(state.user !== null);
    const toast = useToast();

    const bootstrap = async () => {
      try {
        const user = await http.post('/auth');
        const roles = await http.get('/roles');

        if ([ROLE.USER_MANAGER, ROLE.ADMIN].includes(user.role_id)) {
          await queryCache.prefetchQuery('users', () => http.get('/users'), {
            cacheTime: Infinity,
          });
        }

        setAppState({
          user,
          roles,
        });

        setDidInit(true);
      } catch (error) {
        if (!error.status) {
          toast({
            title: 'Unable to load the application.',
            status: 'error',
            duration: null,
            isClosable: false,
          });
        }
      }
    };

    useEffect(() => {
      if (state.user === null) {
        bootstrap();
      }
    }, [state.user]);

    if (!didInit) {
      return (
        <Layout>
          <Box d="flex" flex="1" alignItems="center" justifyContent="center">
            <Spinner size="xl" color="gray.600" />
          </Box>
        </Layout>
      );
    }

    return <Component {...props} />;
  };
}

import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, queryCache } from 'react-query';
import { Box, useToast } from '@chakra-ui/core';
import Layout, { PageHeader, Title, Body } from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import http from '../../utils/http';
import UserForm from '../../components/UserForm';

function NewUser() {
  const toast = useToast();
  const router = useRouter();

  const createUser = ({ username, password, name, roleId }) => {
    const body = { username, password, name };

    if (roleId !== null) {
      body.role_id = roleId;
    }

    return http.post('/users', {
      body,
    });
  };

  const [mutate, { status: createUserMutate }] = useMutation(createUser, {
    onSuccess: (newUser) => {
      queryCache.setQueryData('users', (prevUsers) => [newUser, ...prevUsers]);

      toast({
        title: 'New user created',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/users');
    },
    onError: () => {
      toast({
        title: 'An error occurred.',
        description: 'Unable to create user.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const isSubmitting = createUserMutate === 'loading';

  return (
    <Layout>
      <PageHeader>
        <Title>New User</Title>
      </PageHeader>

      <Body>
        <Box maxWidth="500px" m="0 auto">
          <UserForm onSubmit={(data) => mutate(data)} isSubmitting={isSubmitting} />
        </Box>
      </Body>
    </Layout>
  );
}

export default withAuth(withPermissions([ROLE.USER_MANAGER, ROLE.ADMIN], NewUser));

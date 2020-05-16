import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { Box, Flex, Text, useToast } from '@chakra-ui/core';
import http from '../utils/http';
import UserForm from '../components/UserForm';
import withoutAuth from '../components/withoutAuth';

function Register(props) {
  const toast = useToast();
  const router = useRouter();
  const [isUsernameExistsError, setIsUsernameExistsError] = useState(false);

  const createUser = ({ username, name, password }) => {
    return http.post(`/users`, {
      body: { username, name, password },
    });
  };

  const [createUserMutate, { status: createUserStatus }] = useMutation(createUser, {
    onMutate() {
      setIsUsernameExistsError(false);
    },
    onSuccess() {
      toast({
        title: 'User created',
        description: 'You can now sign in',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/login');
    },
    onError(error) {
      if (error?.status === 409) {
        setIsUsernameExistsError(true);
      } else {
        toast({
          title: 'An error occurred.',
          description: 'Unable to create user.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  const isSubmitting = createUserStatus === 'loading';

  return (
    <Flex align="center" justify="center" w="100%" h="100%" bg="teal.500">
      <Flex
        direction="column"
        justify="center"
        w="100%"
        maxW="400px"
        bg="white"
        p="4"
        rounded="md"
        boxShadow="0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);"
      >
        <Text fontSize="2xl" textAlign="center">
          Create New User
        </Text>
        <Box mt="3">
          <UserForm
            onSubmit={(data) => createUserMutate(data)}
            isSubmitting={isSubmitting}
            usernameExistsError={isUsernameExistsError}
          />
        </Box>
      </Flex>
    </Flex>
  );
}

export default withoutAuth(Register);

import React, { useState, useEffect, useRef } from 'react';
import Router, { useRouter } from 'next/router';
import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  Input,
  FormLabel,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/core';

import withoutAuth from '../components/withoutAuth';
import { setAuthToken } from '../utils/auth';
import http from '../utils/http';

function Login(props) {
  const [loginError, setLoginError] = useState(false);
  const router = useRouter();
  const usernameInputRef = useRef();
  const passwordInputRef = useRef();

  useEffect(() => {
    usernameInputRef.current.focus();

    Router.prefetch('/trips');
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoginError(false);

    const username = usernameInputRef.current.value;
    const password = passwordInputRef.current.value;

    try {
      const { token } = await http.post('/auth/login', {
        body: {
          username,
          password,
        },
      });

      setAuthToken(token);
      router.replace('/');
    } catch (e) {
      setLoginError(true);
      usernameInputRef.current.focus();
    }
  };

  return (
    <Flex align="center" justify="center" w="100%" h="100%" bg="teal.500">
      <Flex direction="column" justify="center" w="100%" maxW="400px" bg="white" p="4" rounded="md">
        <Text fontSize="2xl" textAlign="center">
          Sign in to Travel Plans
        </Text>
        <Box mt="3">
          <form onSubmit={login}>
            <FormControl>
              {loginError && (
                <Box mb="4">
                  <Alert status="error" justifyContent="left">
                    <AlertIcon />
                    <AlertDescription>Invalid credentials</AlertDescription>
                  </Alert>
                </Box>
              )}
              <Box>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input type="text" id="username" ref={usernameInputRef} />
              </Box>
              <Box mt="2">
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input type="password" id="password" ref={passwordInputRef} />
              </Box>
              <Box mt="8">
                <Button width="100%" variantColor="teal" rightIcon="arrow-forward" type="submit">
                  Sign In
                </Button>
              </Box>
            </FormControl>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
}

export default withoutAuth(Login);

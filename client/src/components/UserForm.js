import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  FormControl,
  Input,
  Select,
  FormLabel,
  FormHelperText,
  Flex,
} from '@chakra-ui/core';
import { StateContext } from '../contexts/state';
import { isAdmin } from '../utils/user';

const passwordValidator = /^.{6,}$/;

export default function UserForm({ user, onSubmit, isSubmitting }) {
  const {
    state: { user: currentUser, roles },
  } = useContext(StateContext);

  const [fieldValid, setFieldValid] = useState({
    roleId: true,
    username: true,
    password: true,
    name: true,
  });

  const roleIdRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();

  useEffect(() => {
    if (roleIdRef.current) {
      roleIdRef.current.focus();
    } else if (!user) {
      usernameRef.current.focus();
    }
  }, []);

  const validate = async (e) => {
    e.preventDefault();

    let isFormValid = true;

    setFieldValid({
      roleId: true,
      username: true,
      password: true,
      name: true,
    });

    const roleId = roleIdRef.current ? roleIdRef.current.value : null;
    const username = usernameRef.current ? usernameRef.current.value : null;
    const password = passwordRef.current.value;
    const name = nameRef.current.value;

    if (roleId !== null && !roleId) {
      setFieldValid((state) => ({
        ...state,
        roleId: false,
      }));
      isFormValid = false;
    }

    if (!user && !username.trim()) {
      setFieldValid((state) => ({
        ...state,
        username: false,
      }));
      isFormValid = false;
    }

    if (!name.trim()) {
      setFieldValid((state) => ({
        ...state,
        name: false,
      }));
      isFormValid = false;
    }

    if (!password.match(passwordValidator) && (!user || password.length)) {
      setFieldValid((state) => ({
        ...state,
        password: false,
      }));
      isFormValid = false;
    }

    if (isFormValid) {
      onSubmit({
        roleId,
        username,
        password,
        name,
      });
    }
  };

  const nameField = (
    <FormControl isInvalid={!fieldValid.name}>
      <Box mb="4">
        <FormLabel htmlFor="name" isRequired>
          Name
        </FormLabel>
        <Input
          type="text"
          id="name"
          defaultValue={user?.name}
          ref={nameRef}
          focusBorderColor="teal.400"
        />
      </Box>
    </FormControl>
  );
  const passwordField = (
    <FormControl isInvalid={!fieldValid.password}>
      <Box mb="4">
        <FormLabel htmlFor="password" isRequired={!user}>
          Password
        </FormLabel>
        <Input type="password" id="password" ref={passwordRef} focusBorderColor="teal.400" />
        {user ? (
          <FormHelperText id="email-helper-text">
            If you don't want to change the password, leave this field empty
          </FormHelperText>
        ) : (
          <FormHelperText id="email-helper-text">
            Password needs to be at least 6 characters long
          </FormHelperText>
        )}
      </Box>
    </FormControl>
  );

  return (
    <form onSubmit={validate}>
      {!user && isAdmin(currentUser) && (
        <FormControl isInvalid={!fieldValid.roleId}>
          <Box mb="4">
            <FormLabel htmlFor="role_id" isRequired>
              Role
            </FormLabel>
            <Select ref={roleIdRef} focusBorderColor="teal.400">
              <option value="">Select role</option>
              {roles.map((role) => (
                <option value={role.id} key={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </Box>
        </FormControl>
      )}

      <FormControl isInvalid={!fieldValid.username}>
        <Box mb="4">
          <FormLabel htmlFor="username" isRequired={!user}>
            Username
          </FormLabel>
          <Input
            type="text"
            id="username"
            defaultValue={user?.username}
            isDisabled={!!user}
            ref={usernameRef}
            focusBorderColor="teal.400"
          />
        </Box>
      </FormControl>

      {user ? (
        <>
          {nameField}
          {passwordField}
        </>
      ) : (
        <>
          {passwordField}
          {nameField}
        </>
      )}

      <Box textAlign="center" mt="4">
        <Button
          variantColor="teal"
          type="submit"
          isLoading={isSubmitting}
          loadingText={user ? 'Saving changes...' : 'Creating User...'}
        >
          {user ? 'Save changes' : 'Create User'}
        </Button>
      </Box>
    </form>
  );
}

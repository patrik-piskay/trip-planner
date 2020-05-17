import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, queryCache } from 'react-query';
import {
  Box,
  Text,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from '@chakra-ui/core';
import Layout, { PageHeader, Title, Actions, Body } from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import Error from '../../components/Error';
import { ROLE } from '../../constants';
import http from '../../utils/http';
import { StateContext } from '../../contexts/state';
import UserForm from '../../components/UserForm';
import { isUser } from '../../utils/user';

function User(props) {
  const {
    state: { user: currentUser },
    setAppState,
  } = useContext(StateContext);
  const toast = useToast();
  const router = useRouter();
  const userId = router.query.id;

  const { status, data: user, error } = useQuery(['user', { id: userId }], () =>
    http.get(`/users/${userId}`),
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const onClose = () => setIsDeleteDialogOpen(false);
  const cancelRef = React.useRef();

  const editUser = ({ name, password }) => {
    const body = { name };

    if (password) {
      body.password = password;
    }

    return http.put(`/users/${userId}`, { body });
  };

  const [userEditMutate, { status: userEditStatus }] = useMutation(editUser, {
    onSuccess: (updatedUser) => {
      const usersCache = queryCache.getQueryData('users') || [];

      if (usersCache.length) {
        queryCache.setQueryData('users', (prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === updatedUser.id) {
              return updatedUser;
            }

            return user;
          }),
        );
      }

      queryCache.setQueryData(['user', { id: userId }], updatedUser);

      if (currentUser.id === userId) {
        setAppState({ user: updatedUser });
      }

      toast({
        title: 'User saved',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push(isUser(user) ? '/' : '/users');
    },
    onError: () => {
      toast({
        title: 'An error occurred.',
        description: 'Unable to edit user.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const deleteUser = () => http.delete(`/users/${userId}`);

  const [userDeleteMutate, { status: userDeleteStatus }] = useMutation(deleteUser, {
    onSuccess: (updatedUser) => {
      const usersCache = queryCache.getQueryData('users') || [];

      if (usersCache.length) {
        queryCache.setQueryData('users', (prevUsers) =>
          prevUsers.filter((user) => user.id !== userId),
        );
      }

      queryCache.removeQueries(['user', { id: userId }]);

      toast({
        title: 'User deleted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/users');
    },
    onError: () => {
      toast({
        title: 'An error occurred.',
        description: 'Unable to delete user.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSettled: () => {
      setIsDeleteDialogOpen(false);
    },
  });

  const isDeletingUser = userDeleteStatus === 'loading';
  const isSubmitting = userEditStatus === 'loading';

  return (
    <>
      <Layout>
        <PageHeader>
          <Title>User Profile</Title>
          {user && currentUser.id !== user.id && (
            <Actions>
              <Button variantColor="red" ml="3" onClick={() => setIsDeleteDialogOpen(true)}>
                Delete
              </Button>
            </Actions>
          )}
        </PageHeader>

        <Body>
          {status === 'loading' ? (
            <Box textAlign="center" mt="32">
              <Text color="gray.400" fontSize="xl">
                Loading...
              </Text>
            </Box>
          ) : user ? (
            <Box maxWidth="500px" m="0 auto">
              <UserForm
                key={userId}
                user={user}
                onSubmit={(data) => userEditMutate(data)}
                isSubmitting={isSubmitting}
              />
            </Box>
          ) : (
            <Error error={error} redirectUrl="/users" />
          )}
        </Body>
      </Layout>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => !isDeletingUser && onClose()}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Trip
          </AlertDialogHeader>

          <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isDeletingUser}>
              Cancel
            </Button>
            <Button
              variantColor="red"
              onClick={() => userDeleteMutate()}
              isLoading={isDeletingUser}
              loadingText="Deleting..."
              ml={3}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default withAuth(withPermissions([ROLE.USER, ROLE.USER_MANAGER, ROLE.ADMIN], User));

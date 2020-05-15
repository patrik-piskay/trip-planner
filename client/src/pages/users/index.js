import React, { useContext } from 'react';
import Link from 'next/link';
import { Box, Button, Flex, PseudoBox } from '@chakra-ui/core';
import Layout, { PageHeader, Title, Actions, Body } from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import UserTable from '../../components/UserTable';
import { useGetUsers } from '../../hooks';
import { isAdmin } from '../../utils/user';
import { StateContext } from '../../contexts/state';

function Users() {
  const {
    state: { user },
  } = useContext(StateContext);
  const users = useGetUsers();

  return (
    <Layout>
      <PageHeader>
        <Title>
          {isAdmin(user) ? (
            <Flex align="baseline">
              <Link href="/trips">
                <a>
                  <PseudoBox fontSize="1.2rem" color="gray.500" _hover={{ color: 'teal.500' }}>
                    Trips
                  </PseudoBox>
                </a>
              </Link>
              <Box textDecor="underline" ml={4}>
                Users
              </Box>
            </Flex>
          ) : (
            'Users'
          )}
        </Title>
        <Actions>
          <Link href="/users/new">
            <Button variantColor="teal">Create User</Button>
          </Link>
        </Actions>
      </PageHeader>

      <Body>
        <Box maxWidth="1000px" m="0 auto">
          <UserTable data={users} />
        </Box>
      </Body>
    </Layout>
  );
}

export default withAuth(withPermissions([ROLE.ADMIN, ROLE.USER_MANAGER], Users));

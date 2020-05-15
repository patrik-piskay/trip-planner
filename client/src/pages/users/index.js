import React from 'react';
import Link from 'next/link';
import { Box, Button } from '@chakra-ui/core';
import Layout, { PageHeader, Title, Actions, Body } from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import UserTable from '../../components/UserTable';
import { useGetUsers } from '../../hooks';

function Users() {
  const users = useGetUsers();

  return (
    <Layout>
      <PageHeader>
        <Title>Users</Title>
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

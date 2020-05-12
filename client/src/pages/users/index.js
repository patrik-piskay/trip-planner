import React from 'react';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';

function Users() {
  return <Layout>Users</Layout>;
}

export default withAuth(withPermissions([ROLE.ADMIN, ROLE.USER_MANAGER], Users));

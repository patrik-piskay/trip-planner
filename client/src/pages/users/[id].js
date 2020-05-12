import React from 'react';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';

function User() {
  return <Layout>User</Layout>;
}

export default withAuth(withPermissions([ROLE.USER, ROLE.USER_MANAGER, ROLE.ADMIN], User));

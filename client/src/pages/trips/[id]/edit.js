import React from 'react';
import Layout from '../../../components/Layout';
import withAuth from '../../../components/withAuth';
import withPermissions from '../../../components/withPermissions';
import { ROLE } from '../../../constants';

function TripEdit() {
  return <Layout>TripEdit</Layout>;
}

export default withAuth(withPermissions([ROLE.USER, ROLE.ADMIN], TripEdit));

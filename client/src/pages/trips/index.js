import React from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { Box, Text, Button, Flex } from '@chakra-ui/core';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import TripTable from '../../components/TripTable';
import http from '../../utils/http';

function Trips() {
  const { status, data, error } = useQuery('trips', () => http.get('/trips'));

  return (
    <Layout>
      <Box>
        <Flex align="center" justify="space-between">
          <Text fontSize="2rem" color="teal.400" ml="5">
            My Trips
          </Text>
          <Link href="/trips/new">
            <Button variantColor="teal">New Trip</Button>
          </Link>
        </Flex>
        <Box mt="6">
          {status === 'loading' ? (
            <Box textAlign="center" mt="32">
              <Text color="gray.400" fontSize="xl">
                Loading...
              </Text>
            </Box>
          ) : data.length ? (
            <TripTable data={data} />
          ) : (
            <Box textAlign="center" mt="32">
              <Text color="gray.400" fontSize="xl">
                No trips found
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
}

export default withAuth(withPermissions([ROLE.USER, ROLE.ADMIN], Trips));

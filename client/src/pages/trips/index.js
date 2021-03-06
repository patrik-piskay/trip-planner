import React, { useContext } from 'react';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { Box, Flex, Text, Button, PseudoBox } from '@chakra-ui/core';
import Layout, { PageHeader, Title, Actions, Body } from '../../components/Layout';
import Error from '../../components/Error';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import { StateContext } from '../../contexts/state';
import TripTable from '../../components/TripTable';
import http from '../../utils/http';
import { isAdmin, isUser } from '../../utils/user';
import { usePrint } from '../../hooks';

function Trips() {
  const {
    state: { user },
  } = useContext(StateContext);
  const { status, data: trips, error } = useQuery('trips', () => http.get('/trips'));
  const [isPreparingPrint, setIsPreparingPrint, printIframe] = usePrint('/trips/print');

  return (
    <Layout>
      <PageHeader>
        <Title>
          {isAdmin(user) ? (
            <Flex align="baseline">
              <Box textDecor="underline" mr={4}>
                Trips
              </Box>
              <Link href="/users">
                <a>
                  <PseudoBox fontSize="1.2rem" color="gray.500" _hover={{ color: 'teal.500' }}>
                    Users
                  </PseudoBox>
                </a>
              </Link>
            </Flex>
          ) : (
            'My Trips'
          )}
        </Title>
        <Actions>
          {isUser(user) && !!trips?.length && (
            <Button
              variantColor="teal"
              variant="outline"
              mr="4"
              isLoading={isPreparingPrint}
              loadingText="Preparing for print"
              onClick={() => setIsPreparingPrint(true)}
            >
              Print 30-day plan
            </Button>
          )}
          <Link href="/trips/new">
            <a>
              <Button variantColor="teal">New Trip</Button>
            </a>
          </Link>
        </Actions>
      </PageHeader>

      <Body>
        {status === 'loading' ? (
          <Box textAlign="center" mt="32">
            <Text color="gray.400" fontSize="xl">
              Loading...
            </Text>
          </Box>
        ) : error ? (
          <Error error={error} />
        ) : trips.length ? (
          <Box maxWidth="1000px" m="0 auto">
            <TripTable data={trips} />
          </Box>
        ) : (
          <Box textAlign="center" mt="32">
            <Text color="gray.400" fontSize="xl">
              No trips found
            </Text>
          </Box>
        )}
      </Body>

      {printIframe}
    </Layout>
  );
}

export default withAuth(withPermissions([ROLE.USER, ROLE.ADMIN], Trips));

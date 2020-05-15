import React from 'react';
import { useRouter } from 'next/router';
import { Box, useToast } from '@chakra-ui/core';
import { useMutation, queryCache } from 'react-query';
import Layout, { PageHeader, Title, Body } from '../../components/Layout';
import TripForm from '../../components/TripForm';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import http from '../../utils/http';

function TripNew() {
  const toast = useToast();
  const router = useRouter();

  const createTrip = ({ userId, destination, startDate, endDate, comment }) => {
    const body = {
      destination,
      start_date: startDate,
      end_date: endDate,
      comment,
    };

    if (userId !== null) {
      body.user_id = userId;
    }

    return http.post('/trips', {
      body,
    });
  };

  const [mutate, { status: createTripStatus }] = useMutation(createTrip, {
    onSuccess: (newTrip) => {
      const tripsCache = queryCache.getQueryData('trips') || [];

      if (tripsCache.length) {
        queryCache.setQueryData(['trips'], (prevTrips) => [newTrip, ...prevTrips]);
      } else {
        queryCache.refetchQueries('trips');
      }

      toast({
        title: 'New trip created',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/trips');
    },
    onError: () => {
      toast({
        title: 'An error occurred.',
        description: 'Unable to create trip.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const isSubmitting = createTripStatus === 'loading';

  return (
    <Layout>
      <PageHeader>
        <Title>New Trip</Title>
      </PageHeader>

      <Body>
        <Box maxWidth="500px" m="0 auto">
          <TripForm onSubmit={(data) => mutate(data)} isSubmitting={isSubmitting} />
        </Box>
      </Body>
    </Layout>
  );
}

export default withAuth(withPermissions([ROLE.USER, ROLE.ADMIN], TripNew));

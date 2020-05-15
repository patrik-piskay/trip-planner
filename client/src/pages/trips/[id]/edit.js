import React from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, queryCache } from 'react-query';
import { Box, Text, useToast } from '@chakra-ui/core';
import Layout, { PageHeader, Title, Body } from '../../../components/Layout';
import TripForm from '../../../components/TripForm';
import Error from '../../../components/Error';
import withAuth from '../../../components/withAuth';
import withPermissions from '../../../components/withPermissions';
import { ROLE } from '../../../constants';
import http from '../../../utils/http';

function EditTrip() {
  const toast = useToast();
  const router = useRouter();
  const tripId = router.query.id;

  const { status, data: trip, error } = useQuery(['trip', { id: tripId }], () =>
    http.get(`/trips/${tripId}`),
  );

  const editTrip = ({ destination, startDate, endDate, comment }) => {
    return http.put(`/trips/${tripId}`, {
      body: {
        destination,
        start_date: startDate,
        end_date: endDate,
        comment,
      },
    });
  };

  const [mutate, { status: editTripStatus }] = useMutation(editTrip, {
    onSuccess: (updatedTrip) => {
      const tripsCache = queryCache.getQueryData('trips') || [];
      if (tripsCache.length) {
        queryCache.setQueryData(['trips'], (prevTrips) =>
          prevTrips.map((trip) => {
            if (trip.id === updatedTrip.id) {
              return updatedTrip;
            }

            return trip;
          }),
        );
      } else {
        queryCache.refetchQueries('trips');
      }

      queryCache.setQueryData(['trip', { id: tripId }], updatedTrip);

      toast({
        title: 'Trip saved',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/trips');
    },
    onError: () => {
      toast({
        title: 'An error occurred.',
        description: 'Unable to edit trip.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const isSubmitting = editTripStatus === 'loading';

  return (
    <Layout>
      <PageHeader>
        <Title>Edit Trip</Title>
      </PageHeader>

      <Body>
        {status === 'loading' ? (
          <Box textAlign="center" mt="32">
            <Text color="gray.400" fontSize="xl">
              Loading...
            </Text>
          </Box>
        ) : trip ? (
          <Box maxWidth="500px" m="0 auto">
            <TripForm trip={trip} onSubmit={(data) => mutate(data)} isSubmitting={isSubmitting} />
          </Box>
        ) : (
          <Error error={error} redirectUrl="/trips" />
        )}
      </Body>
    </Layout>
  );
}

export default withAuth(withPermissions([ROLE.USER, ROLE.ADMIN], EditTrip));

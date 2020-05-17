/*@jsx jsx*/
import { jsx, css } from '@emotion/core';

import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, queryCache } from 'react-query';
import {
  Box,
  Text,
  Button,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from '@chakra-ui/core';
import Layout, { PageHeader, Title, Actions, Body } from '../../../components/Layout';
import withAuth from '../../../components/withAuth';
import withPermissions from '../../../components/withPermissions';
import Error from '../../../components/Error';
import { ROLE } from '../../../constants';
import http from '../../../utils/http';
import { useGetUsers } from '../../../hooks';
import { convertUsersToMap, isAdmin } from '../../../utils/user';
import { StateContext } from '../../../contexts/state';

function daysLeftFromNow(date) {
  const currentDate = new Date();
  const tripDate = new Date(date);
  const currentDateUTC = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const tripDateUTC = Date.UTC(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate());

  return Math.floor((tripDateUTC - currentDateUTC) / (1000 * 60 * 60 * 24));
}

function endsInFuture(endDate) {
  const currentDate = new Date();
  const currentDayUTC = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  const tripEndDate = new Date(endDate);
  const tripEndDayUTC = Date.UTC(
    tripEndDate.getFullYear(),
    tripEndDate.getMonth(),
    tripEndDate.getDate(),
  );

  return tripEndDayUTC >= currentDayUTC;
}

function Trip(props) {
  const toast = useToast();
  const router = useRouter();
  const tripId = router.query.id;

  const {
    state: { user },
  } = useContext(StateContext);

  const { status, data: trip, error } = useQuery(['trip', { id: tripId }], () =>
    http.get(`/trips/${tripId}`),
  );

  const allUsersArray = useGetUsers();
  const allUsers = convertUsersToMap(allUsersArray);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const onClose = () => setIsDeleteDialogOpen(false);
  const cancelRef = React.useRef();

  const deleteTrip = () => {
    http.delete(`/trips/${tripId}`);
  };

  const [tripDeleteMutate, { status: tripDeleteStatus }] = useMutation(deleteTrip, {
    onSuccess: (updatedUser) => {
      const tripsCache = queryCache.getQueryData('trips') || [];

      if (tripsCache.length) {
        queryCache.setQueryData('trips', (prevTrips) =>
          prevTrips.filter((trip) => trip.id !== tripId),
        );
      } else {
        queryCache.refetchQueries('trips');
      }

      queryCache.removeQueries(['trip', { id: tripId }]);

      toast({
        title: 'Trip deleted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/trips');
    },
    onError: () => {
      toast({
        title: 'An error occurred.',
        description: 'Unable to delete trip.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSettled: () => {
      setIsDeleteDialogOpen(false);
    },
  });

  const isDeletingTrip = tripDeleteStatus === 'loading';

  const daysLeft = daysLeftFromNow(trip?.start_date);

  return (
    <>
      <Layout>
        <PageHeader>
          <Title>Trip Details</Title>
          {trip && (
            <Actions>
              <Link href="/trips/[id]/edit" as={`/trips/${tripId}/edit`}>
                <a>
                  <Button variantColor="blue">Edit</Button>
                </a>
              </Link>
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
          ) : trip ? (
            <Box maxWidth="1000px" m="0 auto">
              <table
                css={css`
                  td {
                    height: 48px;
                    padding-left: 20px;
                  }

                  td:first-child {
                    text-align: right;
                    font-weight: 500;
                    padding-right: 10px;
                    border-right: 1px solid #e2e8f0;
                    color: #4a5568;
                  }

                  td:last-child {
                    word-break: break-word;
                  }
                `}
              >
                <tbody>
                  <tr>
                    <td>Status</td>
                    <td>
                      {daysLeft < 0 ? (
                        endsInFuture(trip.end_date) ? (
                          <Badge variantColor="orange" px="3" fontSize="0.9em">
                            Ongoing
                          </Badge>
                        ) : (
                          <Badge variantColor="pink" px="3" fontSize="0.9em">
                            Past
                          </Badge>
                        )
                      ) : daysLeft === 0 ? (
                        <Badge variantColor="green" px="3" fontSize="0.9em">
                          <span role="img" aria-label="party emoji">
                            🎉
                          </span>{' '}
                          Today{' '}
                          <span role="img" aria-label="party emoji">
                            🎉
                          </span>
                        </Badge>
                      ) : (
                        <>
                          <Badge variantColor="green" px="3" fontSize="0.9em">
                            Upcoming
                          </Badge>
                          <Badge variantColor="blue" px="3" fontSize="0.9em" ml="4">
                            in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                          </Badge>
                        </>
                      )}
                    </td>
                  </tr>
                  {isAdmin(user) && (
                    <tr>
                      <td>User</td>
                      <td>
                        {allUsers[trip.user_id]?.name || (
                          <Box as="i" color="gray.500">
                            deleted user
                          </Box>
                        )}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>Destination</td>
                    <td>{trip.destination}</td>
                  </tr>
                  <tr>
                    <td>Start Date</td>
                    <td>{trip.start_date}</td>
                  </tr>
                  <tr>
                    <td>End Date</td>
                    <td>{trip.end_date}</td>
                  </tr>
                  <tr>
                    <td>Comment</td>
                    <td>{trip.comment}</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          ) : (
            <Error error={error} redirectUrl="/trips" />
          )}
        </Body>
      </Layout>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => !isDeletingTrip && onClose()}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Trip
          </AlertDialogHeader>

          <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isDeletingTrip}>
              Cancel
            </Button>
            <Button
              variantColor="red"
              onClick={() => tripDeleteMutate()}
              isLoading={isDeletingTrip}
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

export default withAuth(withPermissions([ROLE.USER, ROLE.ADMIN], Trip));

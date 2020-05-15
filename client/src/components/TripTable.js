import React, { useContext } from 'react';
import Link from 'next/link';
import { Box, Button } from '@chakra-ui/core';
import Table from './Table';
import { StateContext } from '../contexts/state';
import { useGetUsers } from '../hooks';
import { isAdmin, convertUsersToMap } from '../utils/user';

export default function TripTable({ data }) {
  const {
    state: { user /*, allUsers*/ },
  } = useContext(StateContext);

  const allUsersArray = useGetUsers();
  const allUsers = convertUsersToMap(allUsersArray);

  const columns = [
    {
      Header: 'Destination',
      accessor: 'destination',
    },
    {
      Header: 'Start Date',
      accessor: 'start_date',
    },
    {
      Header: 'End Date',
      accessor: 'end_date',
    },
    isAdmin(user) && {
      accessor: 'user_id',
      Header: 'User',
      Cell: (props) =>
        allUsers[props.original.user_id]?.name || (
          <Box as="i" color="gray.500">
            deleted user
          </Box>
        ),
      sortMethod: (a, b, desc) => {
        const name1 = allUsers[a]?.name || '[';
        const name2 = allUsers[b]?.name || '[';

        return name1 > name2 ? 1 : -1;
      },
    },
    {
      Header: '',
      Cell: (props) => (
        <Box d="flex" flex="1" justifyContent="center">
          <Link href="/trips/[id]" as={`/trips/${props.original.id}`}>
            <a>
              <Button variantColor="teal" size="sm">
                View
              </Button>
            </a>
          </Link>
        </Box>
      ),
      width: 120,
      sortable: false,
    },
  ].filter(Boolean);

  return <Table data={data} columns={columns} />;
}

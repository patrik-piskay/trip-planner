import React, { useContext, useMemo } from 'react';
import Link from 'next/link';
import { Box, Button, Badge } from '@chakra-ui/core';
import Table from './Table';
import { StateContext } from '../contexts/state';
import { isAdmin } from '../utils/user';
import { useTableSearch } from '../hooks';

export default function UserTable({ data }) {
  const {
    state: { user, roles },
  } = useContext(StateContext);

  const searchInputData = useMemo(
    () =>
      data.map((user) => ({
        ...user,
        role_name: roles.find((role) => role.id === user.role_id).name,
      })),
    [data],
  );

  const { Search, data: filteredData } = useTableSearch(
    searchInputData,
    ['username', 'name', 'role_name'],
    'Search by name, username or role',
  );

  const columns = [
    {
      Header: 'Username',
      accessor: 'username',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    isAdmin(user) && {
      accessor: 'role_id',
      Header: 'Role',
      Cell: (props) => {
        const colors = { 1: 'green', 2: 'blue', 3: 'red' };
        const role = roles.find((role) => props.original.role_id === role.id);

        return (
          role && (
            <Badge variantColor={colors[role.id] || 'gray'} px="3" fontSize="0.8em">
              {role.name}
            </Badge>
          )
        );
      },
    },
    {
      Header: 'Created',
      accessor: 'created_at',
      Cell: (props) =>
        new Date(props.original.created_at * 1000).toLocaleDateString('default', {
          dateStyle: 'long',
        }),
    },
    {
      Header: '',
      Cell: (props) => (
        <Box d="flex" flex="1" justifyContent="center">
          <Link href="/users/[id]" as={`/users/${props.original.id}`}>
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

  return (
    <>
      {Search}
      <Table data={filteredData} noDataText="No users found" columns={columns} />
    </>
  );
}

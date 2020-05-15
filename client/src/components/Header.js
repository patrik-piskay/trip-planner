import React, { useContext } from 'react';
import Link from 'next/link';
import { FaRegPaperPlane, FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import {
  Box,
  Heading,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/core';

import { StateContext } from '../contexts/state';

export default function Header(props) {
  const {
    state: { user },
  } = useContext(StateContext);

  return (
    <Flex
      as="header"
      h={!props.forPrint ? '100px' : '70px'}
      bg="teal.500"
      alignItems="center"
      flexShrink="0"
      padding="16px"
    >
      <Flex width="100%" maxWidth="1168px" margin="0 auto" justifyContent="space-between">
        <Link href="/">
          <Heading as="h1" color="white" d="flex" alignItems="center" cursor="pointer">
            <Box as={FaRegPaperPlane} ml="5" mr="5" />
            Trip Planner
          </Heading>
        </Link>

        {user && !props.forPrint && (
          <Menu>
            <MenuButton>
              <Box d="flex" alignItems="center">
                <Text color="white">{user.name}</Text>
                <Box
                  as={FaUserCircle}
                  size="36px"
                  color="white"
                  border="1px"
                  borderColor="white"
                  rounded="18px"
                  p="1px"
                  ml="2"
                />
              </Box>
            </MenuButton>
            <MenuList>
              <Link href="/users/[id]" as={`/users/${user.id}`}>
                <a>
                  <MenuItem>
                    <Box as={FaUser} mr="2" />
                    Profile
                  </MenuItem>
                </a>
              </Link>
              <MenuDivider />
              <Link href="/logout">
                <a>
                  <MenuItem>
                    <Box as={FaSignOutAlt} mr="2" /> Logout
                  </MenuItem>
                </a>
              </Link>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Flex>
  );
}

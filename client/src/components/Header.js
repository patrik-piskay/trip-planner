import React, { useContext } from 'react';
import Link from 'next/link';
import { FaRegPaperPlane, FaUserCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import {
  Box,
  Heading,
  Flex,
  Avatar,
  Text,
  Button,
  FormControl,
  Input,
  FormLabel,
  Alert,
  AlertIcon,
  AlertDescription,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  MenuOptionGroup,
  MenuItemOption,
} from '@chakra-ui/core';

import { StateContext } from '../contexts/state';

export default function Header(props) {
  const {
    state: { user },
  } = useContext(StateContext);

  return (
    <Flex
      as="header"
      h="100px"
      bg="teal.500"
      alignItems="center"
      justifyContent="space-between"
      p="4"
    >
      <Link href="/">
        <Heading as="h1" color="white" d="flex" alignItems="center" cursor="pointer">
          <Box as={FaRegPaperPlane} ml="5" mr="5" />
          Trip Planner
        </Heading>
      </Link>

      {user && (
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
            <Link href="/profile">
              <MenuItem>
                <Box as={FaUser} mr="2" />
                Profile
              </MenuItem>
            </Link>
            <MenuDivider />
            <Link href="/logout">
              <MenuItem>
                <Box as={FaSignOutAlt} mr="2" /> Logout
              </MenuItem>
            </Link>
          </MenuList>
        </Menu>
      )}
    </Flex>
  );
}

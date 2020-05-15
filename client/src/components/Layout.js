import React from 'react';
import { Box, Flex } from '@chakra-ui/core';
import Header from './Header';

export default function Layout(props) {
  return (
    <Box w="100%" h="100%" bg="white" d="flex" flexDirection="column">
      <Header />
      <Box width="100%" d="flex" flex="1" flexDirection="column" maxWidth="1200px" margin="0 auto">
        <Box p="4" d="flex" flex="1" flexDirection="column">
          {props.children}
        </Box>
      </Box>
    </Box>
  );
}

export function PageHeader({ children }) {
  return (
    <Flex align="center" justify="space-between">
      {children}
    </Flex>
  );
}

export function Title({ children }) {
  return (
    <Box fontSize="2rem" color="teal.400" ml="5">
      {children}
    </Box>
  );
}

export function Actions({ children }) {
  return <div>{children}</div>;
}

export function Body({ children }) {
  return <Box mt="10">{children}</Box>;
}

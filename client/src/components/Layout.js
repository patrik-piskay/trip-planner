import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  FormControl,
  Input,
  FormLabel,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/core';
import Header from './Header';

export default function Layout(props) {
  return (
    <Box w="100%" h="100%" bg="white" d="flex" flexDirection="column">
      <Header />
      <Box p="4" d="flex" flex="1" flexDirection="column">
        {props.children}
      </Box>
    </Box>
  );
}

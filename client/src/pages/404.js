import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { Box, Text } from '@chakra-ui/core';
import Layout from '../components/Layout';

export default function Custom404() {
  return (
    <Layout>
      <Box d="flex" flexDirection="column" flex="1" alignItems="center" justifyContent="center">
        <Box d="flex" alignItems="center">
          <Box as={FaTimesCircle} color="teal" size="40px" mr="4" />
          <Text fontSize="xl">404 - Page Not Found</Text>
        </Box>
      </Box>
    </Layout>
  );
}

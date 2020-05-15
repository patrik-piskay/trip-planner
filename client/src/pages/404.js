import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { Box, Text } from '@chakra-ui/core';
import Layout, { Body } from '../components/Layout';

export default function Custom404() {
  return (
    <Layout>
      <Body>
        <Box mt="48" d="flex" justifyContent="center" alignItems="center">
          <Box as={FaTimesCircle} color="gray.600" size="40px" mr="4" />
          <Text fontSize="xl">404 - Page Not Found</Text>
        </Box>
      </Body>
    </Layout>
  );
}

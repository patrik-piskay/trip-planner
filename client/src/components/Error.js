import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Text, useToast } from '@chakra-ui/core';

export default function Error({ error, redirectUrl }) {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (error.status === 403) {
      router.replace(redirectUrl || '/');
      toast({
        title: 'Not authorized to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else if (error.status !== 404) {
      toast({
        title: 'An error occured.',
        description: error.error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, []);

  return error.status === 404 ? (
    <Box textAlign="center" mt="32">
      <Text color="gray.400" fontSize="xl">
        Not found
      </Text>
    </Box>
  ) : null;
}

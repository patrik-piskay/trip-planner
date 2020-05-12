import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Text,
  Button,
  Flex,
  FormControl,
  Input,
  FormLabel,
  FormHelperText,
  Textarea,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from '@chakra-ui/core';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import http from '../../utils/http';

const dateValidator = /^\d{4}\/\d{2}\/\d{2}$/;

function TripNew() {
  const [fieldValid, setFieldValid] = useState({
    destination: true,
    startDate: true,
    endDate: true,
  });
  const toast = useToast();
  const router = useRouter();

  const destinationRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const commentRef = useRef();

  useEffect(() => {
    destinationRef.current.focus();
  });

  const validate = async (e) => {
    e.preventDefault();

    let isFormValid = true;

    setFieldValid({
      destination: true,
      startDate: true,
      endDate: true,
    });

    const destination = destinationRef.current.value;
    const startDate = startDateRef.current.value;
    const endDate = endDateRef.current.value;
    const comment = commentRef.current.value;

    if (!destination.trim()) {
      setFieldValid((state) => ({
        ...state,
        destination: false,
      }));
      isFormValid = false;
    }

    if (!startDate.match(dateValidator)) {
      setFieldValid((state) => ({
        ...state,
        startDate: false,
      }));
      isFormValid = false;
    }

    if (!endDate.match(dateValidator)) {
      setFieldValid((state) => ({
        ...state,
        endDate: false,
      }));
      isFormValid = false;
    }

    if (isFormValid) {
      http
        .post('/trips', {
          body: {
            destination,
            start_date: startDate,
            end_date: endDate,
            comment,
          },
        })
        .then(
          () => {
            toast({
              title: 'New trip created',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });

            router.push('/trips');
          },
          () => {
            toast({
              title: 'An error occurred.',
              description: 'Unable to create trip.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          },
        );
    }
  };

  return (
    <Layout>
      <Box>
        <Flex align="center" justify="space-between">
          <Text fontSize="2rem" color="teal.400" ml="5">
            New Trip
          </Text>
        </Flex>
        <Box mt="6">
          <Box maxWidth="500px" m="0 auto">
            <form onSubmit={validate}>
              <FormControl isInvalid={!fieldValid.destination}>
                <Box>
                  <FormLabel htmlFor="destination" isRequired>
                    Destination
                  </FormLabel>
                  <Input type="text" id="destination" ref={destinationRef} />
                </Box>
              </FormControl>

              <FormControl isInvalid={!fieldValid.startDate}>
                <Box mt="4">
                  <FormLabel htmlFor="start_date" isRequired>
                    Start Date
                  </FormLabel>
                  <Input type="text" id="start_date" ref={startDateRef} />
                  <FormHelperText id="email-helper-text">Enter in YYYY/MM/DD format</FormHelperText>
                </Box>
              </FormControl>

              <FormControl isInvalid={!fieldValid.endDate}>
                <Box mt="4">
                  <FormLabel htmlFor="end_date" isRequired>
                    End Date
                  </FormLabel>
                  <Input type="text" id="end_date" ref={endDateRef} />
                  <FormHelperText id="email-helper-text">Enter in YYYY/MM/DD format</FormHelperText>
                </Box>
              </FormControl>

              <FormControl>
                <Box mt="4">
                  <FormLabel htmlFor="comment">Comment</FormLabel>
                  <Textarea id="comment" ref={commentRef} />
                </Box>
              </FormControl>

              <Box mt="8" textAlign="center">
                <Button variantColor="teal" type="submit">
                  Create Trip
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}

export default withAuth(withPermissions([ROLE.USER, ROLE.ADMIN], TripNew));

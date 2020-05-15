import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  FormControl,
  Input,
  Select,
  FormLabel,
  FormHelperText,
  Textarea,
} from '@chakra-ui/core';
import { StateContext } from '../contexts/state';
import { useGetUsers } from '../hooks';
import { isUser, isAdmin } from '../utils/user';

const dateValidator = /^\d{4}\/\d{2}\/\d{2}$/;

const sortByNameAsc = (a, b) => (a.name < b.name ? -1 : 1);

export default function TripForm({ trip, onSubmit, isSubmitting }) {
  const {
    state: { user },
  } = useContext(StateContext);

  const allUsers = useGetUsers();

  const [fieldValid, setFieldValid] = useState({
    userId: true,
    destination: true,
    startDate: true,
    endDate: true,
  });

  const userIdRef = useRef();
  const destinationRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const commentRef = useRef();

  useEffect(() => {
    if (userIdRef.current) {
      userIdRef.current.focus();
    } else {
      destinationRef.current.focus();
    }
  }, []);

  const validate = async (e) => {
    e.preventDefault();

    let isFormValid = true;

    setFieldValid({
      userId: true,
      destination: true,
      startDate: true,
      endDate: true,
    });

    const userId = userIdRef.current ? userIdRef.current.value : null;
    const destination = destinationRef.current.value;
    const startDate = startDateRef.current.value;
    const endDate = endDateRef.current.value;
    const comment = commentRef.current.value;

    if (userId !== null && !userId) {
      setFieldValid((state) => ({
        ...state,
        userId: false,
      }));
      isFormValid = false;
    }

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
      onSubmit({
        userId,
        destination,
        startDate,
        endDate,
        comment,
      });
    }
  };

  return (
    <form onSubmit={validate}>
      {!trip && isAdmin(user) && (
        <FormControl isInvalid={!fieldValid.userId}>
          <Box mb="4">
            <FormLabel htmlFor="user_id" isRequired>
              User
            </FormLabel>
            <Select ref={userIdRef}>
              <option value="">Select user</option>
              {allUsers
                .filter((user) => isUser(user))
                .sort(sortByNameAsc)
                .map((user) => (
                  <option value={user.id} key={user.id}>
                    {user.name}
                  </option>
                ))}
            </Select>
          </Box>
        </FormControl>
      )}

      <FormControl isInvalid={!fieldValid.destination}>
        <Box mb="4">
          <FormLabel htmlFor="destination" isRequired>
            Destination
          </FormLabel>
          <Input
            type="text"
            id="destination"
            defaultValue={trip?.destination}
            ref={destinationRef}
          />
        </Box>
      </FormControl>

      <FormControl isInvalid={!fieldValid.startDate}>
        <Box mb="4">
          <FormLabel htmlFor="start_date" isRequired>
            Start Date
          </FormLabel>
          <Input type="text" id="start_date" defaultValue={trip?.start_date} ref={startDateRef} />
          <FormHelperText id="email-helper-text">Enter in YYYY/MM/DD format</FormHelperText>
        </Box>
      </FormControl>

      <FormControl isInvalid={!fieldValid.endDate}>
        <Box mb="4">
          <FormLabel htmlFor="end_date" isRequired>
            End Date
          </FormLabel>
          <Input type="text" id="end_date" defaultValue={trip?.end_date} ref={endDateRef} />
          <FormHelperText id="email-helper-text">Enter in YYYY/MM/DD format</FormHelperText>
        </Box>
      </FormControl>

      <FormControl>
        <Box mb="8">
          <FormLabel htmlFor="comment">Comment</FormLabel>
          <Textarea id="comment" defaultValue={trip?.comment} ref={commentRef} />
        </Box>
      </FormControl>

      <Box textAlign="center">
        <Button
          variantColor="teal"
          type="submit"
          isLoading={isSubmitting}
          loadingText={trip ? 'Saving Trip...' : 'Creating Trip...'}
        >
          {trip ? 'Save Trip' : 'Create Trip'}
        </Button>
      </Box>
    </form>
  );
}

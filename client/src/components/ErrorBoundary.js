import React from 'react';
import { Button, Box } from '@chakra-ui/core';

export default class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  render() {
    return this.props.children({
      hasError: this.state.hasError,
    });
  }
}

export const ErrorMessage = ({ reset }) => (
  <Box>
    <Box>{"We're sorry, an unexpected error has occurred. Please try reloading the page."}</Box>
    <Button variantColor="teal" onClick={reset} mt="6">
      {'Reload'}
    </Button>
  </Box>
);

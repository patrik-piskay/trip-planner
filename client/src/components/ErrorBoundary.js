import React from 'react';
import { Button } from '@chakra-ui/core';

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
  <div className="pa-errorBoundary">
    <div className="pa-errorBoundary-message">
      {"We're sorry, an unexpected error has occurred. Please try reloading the page."}
    </div>
    <br />
    <Button variant="primary" onClick={reset}>
      {'Reload'}
    </Button>
  </div>
);

import React from 'react';
import { ThemeProvider, CSSReset } from '@chakra-ui/core';
import { Global, css } from '@emotion/core';
import { ReactQueryDevtools } from 'react-query-devtools';
import ErrorBoundary, { ErrorMessage } from '../components/ErrorBoundary';
import { StateProvider } from '../contexts/state';

import 'react-table-v6/react-table.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Global
        styles={css`
          html,
          body,
          #__next {
            height: 100%;
            width: 100%;
          }
        `}
      />

      <ReactQueryDevtools initialIsOpen={false} />

      <ErrorBoundary>
        {({ hasError }) =>
          !hasError ? (
            <ThemeProvider>
              <CSSReset />
              <StateProvider>
                <Component {...pageProps} />
              </StateProvider>
            </ThemeProvider>
          ) : (
            <ErrorMessage />
          )
        }
      </ErrorBoundary>
    </>
  );
}

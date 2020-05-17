import React from 'react';
import { Global, css } from '@emotion/core';
import { ReactQueryConfigProvider } from 'react-query';
import { ThemeProvider, CSSReset } from '@chakra-ui/core';
import { ReactQueryDevtools } from 'react-query-devtools';
import ErrorBoundary, { ErrorMessage } from '../components/ErrorBoundary';
import { StateProvider } from '../contexts/state';
import Layout from '../components/Layout';

import 'react-table-v6/react-table.css';

const queryConfig = { retry: false, refetchAllOnWindowFocus: false };

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

          .ReactTable {
            border: 1px solid rgba(0, 0, 0, 0.05);
            border-radius: 3px;

            .rt-tbody .rt-tr {
              min-height: 48px;
            }

            .rt-thead {
              .rt-th .rt-resizable-header-content {
                min-height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 500;
                font-size: 1.1rem;
                color: #2d3748;
              }

              .rt-th.-sort-asc,
              .rt-td.-sort-asc {
                box-shadow: inset 0 3px 0 0 #319795;
              }

              .rt-th.-sort-desc,
              .rt-td.-sort-desc {
                box-shadow: inset 0 -3px 0 0 #319795;
              }
            }

            .rt-tbody {
              .rt-tr-group {
                border-bottom: none;
              }

              .rt-tr.-odd {
                background-color: #f7fafc;
              }

              .rt-td {
                display: flex;
                align-items: center;
                padding: 7px 14px;
                white-space: normal;
                word-break: break-word;
              }
            }

            .rt-noData {
              position: unset;
              left: auto;
              top: auto;
              transform: none;
              background: none;
              text-align: center;
              border-top: 1px solid rgba(0, 0, 0, 0.05);
            }
          }
        `}
      />

      <ReactQueryDevtools initialIsOpen={false} />

      <ErrorBoundary>
        {({ hasError }) =>
          !hasError ? (
            <ThemeProvider>
              <CSSReset />
              <ReactQueryConfigProvider config={queryConfig}>
                <StateProvider>
                  <Component {...pageProps} />
                </StateProvider>
              </ReactQueryConfigProvider>
            </ThemeProvider>
          ) : (
            <Layout>
              <ErrorMessage />
            </Layout>
          )
        }
      </ErrorBoundary>
    </>
  );
}

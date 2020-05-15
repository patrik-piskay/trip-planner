import React, { useContext, useState, useEffect } from 'react';
import { useQuery, queryCache } from 'react-query';
import * as JsSearch from 'js-search';

import { InputGroup, Input, Icon, InputLeftElement } from '@chakra-ui/core';
import { StateContext } from '../contexts/state';
import http from '../utils/http';
import { ROLE } from '../constants';

export function useGetUsers() {
  const {
    state: { user },
  } = useContext(StateContext);

  const shouldFetchUsers = [ROLE.USER_MANAGER, ROLE.ADMIN].includes(user.role_id);

  const { data: users } = useQuery(shouldFetchUsers && 'users', () => http.get('/users'), {
    cacheTime: Infinity,
    initialData: shouldFetchUsers ? queryCache.getQueryData('users') : [],
  });

  return users;
}

const Search = ({ searchText, setSearchText, placeholder }) => (
  <InputGroup mt="-1rem" w="100%" maxW="350px" mb="5">
    <InputLeftElement children={<Icon name="search" color="gray.300" />} />
    <Input
      type="text"
      placeholder={placeholder || 'Search'}
      value={searchText}
      onChange={({ target: { value } }) => setSearchText(value)}
    />
  </InputGroup>
);

export function useTableSearch(inputData, indexes = [], placeholder) {
  const [dataToRender, setDataToRender] = useState(inputData);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (searchText.length > 0) {
      const search = new JsSearch.Search('id');
      search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();

      indexes.forEach((index) => search.addIndex(index));

      search.addDocuments(inputData);

      setDataToRender(search.search(searchText));
    } else {
      setDataToRender(inputData);
    }
  }, [searchText, inputData]);

  return {
    Search: (
      <Search searchText={searchText} setSearchText={setSearchText} placeholder={placeholder} />
    ),
    data: dataToRender,
  };
}

const printIframe = <iframe src="" style={{ visibility: 'hidden', height: '1px' }} id="forPrint" />;

export function usePrint(printUrl) {
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  useEffect(() => {
    const iframe = document.getElementById('forPrint');

    if (isPreparingPrint) {
      iframe.src = printUrl;

      const messageHandler = (message) => {
        if (message.data === 'data-loaded') {
          setIsPreparingPrint(false);

          document.getElementById('forPrint').contentWindow.print();
        }
      };

      window.addEventListener('message', messageHandler);

      return () => window.removeEventListener('message', messageHandler);
    } else {
      iframe.src = '';
    }
  }, [isPreparingPrint, printUrl]);

  return [isPreparingPrint, setIsPreparingPrint, printIframe];
}

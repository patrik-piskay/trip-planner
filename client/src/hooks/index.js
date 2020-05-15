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
  <InputGroup mt="-1.25rem" w="100%" maxW="350px" mb="5">
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

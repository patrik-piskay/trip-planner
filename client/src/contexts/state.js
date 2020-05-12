import React, { useState } from 'react';

export const StateContext = React.createContext({});

export const initialState = {
  user: null,
  roles: [],
};

export const StateProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const setAppState = (partial) => {
    setState((prevState) => ({
      ...prevState,
      ...partial,
    }));
  };

  return <StateContext.Provider value={{ state, setAppState }}>{children}</StateContext.Provider>;
};

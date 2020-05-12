import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { StateContext } from '../contexts/state';

export default function withPermissions(rolesAllowed, Component) {
  return (props) => {
    const {
      state: {
        user: { role_id },
      },
    } = useContext(StateContext);
    const router = useRouter();

    if (!rolesAllowed.includes(role_id)) {
      router.replace('/');

      return null;
    }

    return <Component {...props} />;
  };
}

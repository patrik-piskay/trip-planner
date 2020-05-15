import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuthToken } from '../utils/auth';

export default function withoutAuth(Component) {
  return (props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(undefined);
    const router = useRouter();
    const token = getAuthToken();

    useEffect(() => {
      if (!token) {
        setIsLoggedIn(false);
      } else {
        router.replace('/');
      }
    }, [token]);

    return isLoggedIn === false ? <Component {...props} /> : null;
  };
}

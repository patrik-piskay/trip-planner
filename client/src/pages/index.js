import { useContext } from 'react';
import { useRouter } from 'next/router';
import { StateContext } from '../contexts/state';

import withAuth from '../components/withAuth';
import { ROLE } from '../constants';

function Home() {
  const {
    state: { user },
  } = useContext(StateContext);
  const router = useRouter();

  switch (user.role_id) {
    case ROLE.USER:
    case ROLE.ADMIN:
      router.replace('/trips');
      break;

    case ROLE.USER_MANAGER:
      router.replace('/users');
      break;

    default:
  }

  return null;
}

export default withAuth(Home);

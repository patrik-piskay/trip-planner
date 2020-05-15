import { ROLE } from '../constants';

export const convertUsersToMap = (userArray) => {
  return userArray.reduce((userMap, user) => {
    userMap[user.id] = user;

    return userMap;
  }, {});
};

export const isUser = (user) => user.role_id === ROLE.USER;
export const isUserManager = (user) => user.role_id === ROLE.USER_MANAGER;
export const isAdmin = (user) => user.role_id === ROLE.ADMIN;

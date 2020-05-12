export const getAuthToken = () => {
  try {
    return window.localStorage.getItem('authToken');
  } catch (e) {}
};

export const setAuthToken = (token) => {
  try {
    return window.localStorage.setItem('authToken', token);
  } catch (e) {}
};

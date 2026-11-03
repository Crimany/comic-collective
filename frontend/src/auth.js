// Returns the stored session, or null if there is none or its token has expired
export const getUserInfo = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (!userInfo?.token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(userInfo.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('userInfo');
      return null;
    }
  } catch (err) {
    localStorage.removeItem('userInfo');
    return null;
  }

  return userInfo;
};

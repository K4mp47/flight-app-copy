import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, []);

  return userId;
};

import { useEffect, useState } from 'react';
import { getDevice } from '../modules/helpers';
import { TAuth } from '../components/types';

export const useAuth = () => {
  const [auth, setAuth] = useState<TAuth>();

  useEffect(() => {
    const fetchAuth = async () => {
      const { token, serverUrl, clientIdentifier } = await getDevice();
      setAuth({ token, serverUrl, clientIdentifier });
    };
    fetchAuth();
  }, []);

  return { auth };
};

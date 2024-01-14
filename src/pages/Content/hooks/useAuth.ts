import { useEffect, useState } from 'react';
import { getUrl } from '../modules/helpers';
import { TAuth } from '../components/types';

export const useAuth = () => {
  const [auth, setAuth] = useState<TAuth>();

  useEffect(() => {
    const fetchAuth = async () => {
      const { token, serverUrl, clientIdentifier } = await getUrl();
      setAuth({ token, serverUrl, clientIdentifier });
    };
    fetchAuth();
  }, []);

  return { auth };
};

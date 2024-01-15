import React from 'react';
import { createRoot } from 'react-dom/client';

import SubtitleSearch from './components/SubtitleSearch';
import { useAuth } from './hooks/useAuth';
import { useMutation } from './hooks/useMutation';

import './content.styles.css';
import { getLocalChrome } from './modules/storageHelpers';
import { LOCAL_OPTIONS } from './constants';

const container = document.createElement('div');
container.id = 'content-container';
document.body.appendChild(container);
const root = createRoot(container);

const App = ({ options }: any) => {
  const { auth } = useAuth();
  const { seek } = useMutation({ auth, options });
  return !!seek ? <SubtitleSearch subseek={seek} /> : null;
};

getLocalChrome(LOCAL_OPTIONS, (options) => {
  root.render(<App options={options} />);
});

import React from 'react';
import { createRoot } from 'react-dom/client';

import SubtitleSearch from './components/SubtitleSearch';
import { useAuth } from './hooks/useAuth';
import { useMutation } from './hooks/useMutation';

import './content.styles.css';

const container = document.createElement('div');
container.id = 'content-container';
document.body.appendChild(container);
const root = createRoot(container);

const App = () => {
  const { auth } = useAuth();
  const { seek } = useMutation(auth);
  return seek?.videoEl ? <SubtitleSearch subseek={seek} /> : null;
};

root.render(<App />);

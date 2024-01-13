import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/App';

import './content.styles.css';

const container = document.createElement('div');
container.id = 'content-container';
document.body.appendChild(container);

const root = createRoot(container);
root.render(<App />);

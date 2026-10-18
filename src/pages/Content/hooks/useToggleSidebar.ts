import { useState } from 'react';

// Have to keep the chrome.action state (in background.js) in line with the component
// so there is some things happening here
export const useToggleSidebar = ({
  setSelectedSub,
}: {
  setSelectedSub: (item: undefined) => void;
}) => {
  const [isListenerSet, setIsListenerSet] = useState(false);
  const [isClosed, setIsClosed] = useState(true);

  const onOpen = () => {
    setIsClosed(false);
    chrome.runtime.sendMessage({ type: 'openSubSeek' });
  };

  const onClose = () => {
    setSelectedSub(undefined);
    setIsClosed(true);
    chrome.runtime.sendMessage({ type: 'closeSubSeek' });
  };

  if (!isListenerSet) {
    chrome.runtime.onMessage.addListener((request: { message: string }) => {
      if (request.message === 'openSubSeek') {
        onOpen();
      }
      if (request.message === 'closeSubSeek') {
        onClose();
      }
    });
    setIsListenerSet(true);
  }

  return {
    isClosed,
    openSubSeek: onOpen,
    closeSubSeek: onClose,
  };
};

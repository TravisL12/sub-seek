import { useEffect, useState } from 'react';

// Have to keep the chrome.action state (in background.js) in line with the component
// so there is some things happening here
export const useToggleSidebar = ({
  setSelectedSub,
}: {
  setSelectedSub: (item: undefined) => void;
}) => {
  const [isListenerSet, setIsListenerSet] = useState(false);
  const [isClosed, setIsClosed] = useState(true);

  const sendClosedMessage = () => {
    chrome.runtime.sendMessage({
      type: 'closeSubSeek',
    });
  };

  const sendOpenedMessage = () => {
    chrome.runtime.sendMessage({
      type: 'openSubSeek',
    });
  };

  const onOpen = () => {
    setIsClosed(false);
    sendOpenedMessage();
  };

  const onClose = () => {
    setSelectedSub(undefined);
    setIsClosed(true);
    sendClosedMessage();
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

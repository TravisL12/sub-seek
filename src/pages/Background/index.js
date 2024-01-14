let isOpen = false;

chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    if (isOpen) {
      chrome.tabs.sendMessage(activeTab.id, {
        message: 'closeSubSeek',
      });
    } else {
      chrome.tabs.sendMessage(activeTab.id, {
        message: 'openSubSeek',
      });
    }
    isOpen = !isOpen;
  });
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message.type === 'closeSubSeek') {
    isOpen = false;
  }
  if (message.type === 'openSubSeek') {
    isOpen = true;
  }
});

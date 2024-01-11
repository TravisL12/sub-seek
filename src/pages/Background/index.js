chrome.action.onClicked.addListener((tab) => {
  console.log('subseek CLICKED!');
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['../Content/index.js'],
  });
});

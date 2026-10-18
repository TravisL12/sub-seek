import { TAppOptions } from '../components/types';

// LOCAL STORAGE
export const getLocalChrome = (
  options: string[],
  callback: (items: TAppOptions) => void
) => {
  chrome.storage.local.get(options, callback);
};

export const setLocalChrome = (
  options: TAppOptions,
  callback?: () => void
) => {
  chrome.storage.local.set(options, callback);
};

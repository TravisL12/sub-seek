import { TAppOptions } from '../components/types';

// LOCAL STORAGE
export const getLocalChrome = (
  options: (keyof TAppOptions)[],
  callback: (params?: any) => void
) => {
  chrome.storage.local.get(options, callback);
};

export const setLocalChrome = (
  options: { [key: string]: any },
  callback?: (params?: any) => void
) => {
  chrome.storage.local.set(options, callback);
};

import React from 'react';
export type TAuth = {
  token: string;
  serverUrl: string;
  clientIdentifier: string;
};
export type TSubtitle = {
  id: string;
  startTime: string;
  startSeconds: number;
  endTime: string;
  endSeconds: number;
  text: string;
  ref?: React.RefObject<any>;
};

export type TSubseek = {
  getSubtitles: () => Promise<TSubtitle[]>;
  getSessions: () => void;
  getEvents: () => EventSource;
  videoEl?: HTMLVideoElement;
  auth: TAuth;
};

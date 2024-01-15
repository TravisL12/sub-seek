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
  getSubtitles: (
    keyId: string,
    prevSub?: any,
    isNewChoice?: boolean
  ) => Promise<TSubtitle[]>;
  getSessions: () => void;
  getEvents: () => EventSource;
  getMetadata: (keyId: string) => void;
  videoEl?: HTMLVideoElement;
  auth: TAuth;
  subtitleResultIdx: number;
  subtitleResults?: { [key: string]: any[] };
};

export type TAppOptions = {};

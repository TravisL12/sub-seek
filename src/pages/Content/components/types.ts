import React from 'react';
import { SUBTITLE_INDICES } from '../constants';

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
  getEvents: () => EventSource;
  getMetadata: (keyId: string) => void;
  videoEl?: HTMLVideoElement;
  auth: TAuth;
  api: any;
  currentMedia?: any;
  subtitleResultIndices: { [key: string]: number };
  subtitleResults?: { [key: string]: any[] };
};

export type TAppOptions = {
  [SUBTITLE_INDICES]?: { [key: string]: number };
};

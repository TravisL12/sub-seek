import React from 'react';
import { SUBTITLE_INDICES } from '../constants';

export type TAuth = {
  token: string;
  serverUrl: string;
  clientIdentifier: string;
};

type TConnection = {
  uri: string;
};
export type TServerDevice = {
  token: string;
  remoteClientIdentifier: string;
  connections: TConnection[];
};

export type TSubtitle = {
  id: string;
  startTime: string;
  startSeconds: number;
  endTime: string;
  endSeconds: number;
  text: string;
  ref?: React.RefObject<HTMLDivElement>;
};

export type TSubtitleResult = {
  title?: string;
  displayTitle?: string;
  language?: string;
  languageCode?: string;
  providerTitle?: string;
  hearingImpaired?: boolean;
  forced?: boolean;
};

export type TPlaySessionState = {
  clientIdentifier: string;
  ratingKey: string;
  state: string;
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
  subtitleResults?: { [key: string]: TSubtitleResult[] };
};

export type TAppOptions = {
  [SUBTITLE_INDICES]?: { [key: string]: number };
};

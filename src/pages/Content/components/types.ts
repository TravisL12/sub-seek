import React from 'react';
import { SUBTITLE_INDICES, SUBTITLE_STREAM_KEYS } from '../constants';

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
  // Resolves to undefined when a newer load started before this one finished
  getSubtitles: (
    keyId: string,
    isNewChoice?: boolean
  ) => Promise<TSubtitle[] | undefined>;
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
  [SUBTITLE_STREAM_KEYS]?: { [key: string]: string };
};

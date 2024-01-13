import React from 'react';

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
  videoEl: HTMLVideoElement;
};

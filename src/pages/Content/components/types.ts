export type TSubtitle = {
  id: string;
  startTime: string;
  startSeconds: number;
  endTime: string;
  endSeconds: number;
  text: string;
};

export type TSubseek = {
  getSubtitles: () => Promise<TSubtitle[]>;
  videoEl: HTMLVideoElement;
};

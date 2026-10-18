export const ENDPOINTS = {
  metadata: '/library/metadata',
  parts: '/library/parts',
  eventSource: '/:/eventsource/notifications',
};

export const SRT_CODEC = 'srt';

export const PLEX_TV_URL =
  'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1&includeIPv6=1';

export const VIDEO_PLAYER_SELECTOR = 'video[class^="HTMLMedia-mediaElement"]';

export const SUBTITLE_INDICES = 'subtitleIndices';
export const LOCAL_OPTIONS = [SUBTITLE_INDICES];

// Seeking to a line starts this many seconds early so the line isn't clipped
export const SEEK_LEAD_IN_SECONDS = 1.5;

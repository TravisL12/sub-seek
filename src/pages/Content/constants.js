export const ENDPOINTS = {
  session: '/status/sessions',
  metadata: '/library/metadata',
  sections: '/library/sections',
  streams: '/library/stream',
  parts: '/library/parts',
  devices: '/devices',
  eventSource: '/:/eventsource/notifications',
};

export const SRT_CODEC = 'srt';

export const PLEX_TV_URL =
  'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1&includeIPv6=1';

export const VIDEO_PLAYER_SELECTOR = 'video[class^="HTMLMedia-mediaElement"]';

export const SUBTITLE_INDICES = 'subtitleIndices';
export const LOCAL_OPTIONS = [SUBTITLE_INDICES];

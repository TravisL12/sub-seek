# Plex SubSeek

Find a part of the movie by searching the script, then jump to that part of the movie.

### search for subtitles

GET
`/library/metadata/2190/subtitles?language=en&hearingImpaired=0&forced=0&X-Plex-Product=Plex%20Web&X-Plex-Version=4.121.1&X-Plex-Client-Identifier=191gnhmhql5gnsry9nl1tqql&X-Plex-Platform=Chrome&X-Plex-Platform-Version=120.0&X-Plex-Features=external-media%2Cindirect-media%2Chub-style-list&X-Plex-Model=hosted&X-Plex-Device=OSX&X-Plex-Device-Name=Chrome&X-Plex-Device-Screen-Resolution=1408x595%2C1680x1050&X-Plex-Token=6ame655L9SfANxFqQ_tn&X-Plex-Language=en&X-Plex-Session-Id=8a72f437-89e9-4ae0-82b8-c6b6853c8993
`

### save subtitles

Probably don't need all of these params, but figure that out later

PUT
`/library/metadata/2190/subtitles?key=%2Flibrary%2Fstreams%2F19772&codec=srt&language=eng&hearingImpaired=0&forced=0&providerTitle=OpenSubtitles&X-Plex-Product=Plex%20Web&X-Plex-Version=4.121.1&X-Plex-Client-Identifier=191gnhmhql5gnsry9nl1tqql&X-Plex-Platform=Chrome&X-Plex-Platform-Version=120.0&X-Plex-Features=external-media%2Cindirect-media%2Chub-style-list&X-Plex-Model=hosted&X-Plex-Device=OSX&X-Plex-Device-Name=Chrome&X-Plex-Device-Screen-Resolution=1408x595%2C1680x1050&X-Plex-Token=6ame655L9SfANxFqQ_tn&X-Plex-Language=en&X-Plex-Session-Id=8a72f437-89e9-4ae0-82b8-c6b6853c8993
`

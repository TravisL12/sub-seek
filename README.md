# Plex SubSeek

A Chrome Extension for finding a part of the movie by searching the script, then jump to that part of the movie.

### Development

This has been built using the [chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react)! It has made it very easy to bootstrap a typescript based Chrome Extension using Manifest version 3. But there are a few snafu's.

The use of the development command (`yarn start`) causes issues with SockJS and most pages during development doing this crashes. So instead you must use `yarn build` and reload the extension in Chrome every time changes are made. It's not ideal but that's what you have to do.

### search for subtitles

GET
`/library/metadata/2190/subtitles?X-Plex-Token=6ame655L9SfANxFqQ_tn&language=en&hearingImpaired=0&forced=0&X-Plex-Product=Plex%20Web&X-Plex-Version=4.121.1&X-Plex-Client-Identifier=191gnhmhql5gnsry9nl1tqql&X-Plex-Platform=Chrome&X-Plex-Platform-Version=120.0&X-Plex-Features=external-media%2Cindirect-media%2Chub-style-list&X-Plex-Model=hosted&X-Plex-Device=OSX&X-Plex-Device-Name=Chrome&X-Plex-Device-Screen-Resolution=1408x595%2C1680x1050&X-Plex-Language=en&X-Plex-Session-Id=8a72f437-89e9-4ae0-82b8-c6b6853c8993
`
X-Plex-Token=6ame655L9SfANxFqQ_tn
&language=en
&hearingImpaired=0
&forced=0
&X-Plex-Product=Plex%20Web
&X-Plex-Version=4.121.1
&X-Plex-Client-Identifier=191gnhmhql5gnsry9nl1tqql
&X-Plex-Platform=Chrome
&X-Plex-Platform-Version=120.0
&X-Plex-Features=external-media%2Cindirect-media%2Chub-style-list
&X-Plex-Model=hosted
&X-Plex-Device=OSX
&X-Plex-Device-Name=Chrome
&X-Plex-Device-Screen-Resolution=1408x595%2C1680x1050
&X-Plex-Language=en&X-Plex-Session-Id=8a72f437-89e9-4ae0-82b8-c6b6853c8993

### save subtitles

Probably don't need all of these params, but figure that out later

PUT
`/library/metadata/2190/subtitles?X-Plex-Token=6ame655L9SfANxFqQ_tn&key=%2Flibrary%2Fstreams%2F19772&codec=srt&language=eng&hearingImpaired=0&forced=0&providerTitle=OpenSubtitles&X-Plex-Product=Plex%20Web&X-Plex-Version=4.121.1&X-Plex-Client-Identifier=191gnhmhql5gnsry9nl1tqql&X-Plex-Platform=Chrome&X-Plex-Platform-Version=120.0&X-Plex-Features=external-media%2Cindirect-media%2Chub-style-list&X-Plex-Model=hosted&X-Plex-Device=OSX&X-Plex-Device-Name=Chrome&X-Plex-Device-Screen-Resolution=1408x595%2C1680x1050&X-Plex-Language=en&X-Plex-Session-Id=8a72f437-89e9-4ae0-82b8-c6b6853c8993
`

?X-Plex-Token=6ame655L9SfANxFqQ_tn
&key=%2Flibrary%2Fstreams%2F19772
&codec=srt
&language=eng
&hearingImpaired=0
&forced=0
&providerTitle=OpenSubtitles
&X-Plex-Product=Plex%20Web
&X-Plex-Version=4.121.1
&X-Plex-Client-Identifier=191gnhmhql5gnsry9nl1tqql
&X-Plex-Platform=Chrome
&X-Plex-Platform-Version=120.0
&X-Plex-Features=external-media%2Cindirect-media%2Chub-style-list
&X-Plex-Model=hosted
&X-Plex-Device=OSX
&X-Plex-Device-Name=Chrome
&X-Plex-Device-Screen-Resolution=1408x595%2C1680x1050
&X-Plex-Language=en
&X-Plex-Session-Id=8a72f437-89e9-4ae0-82b8-c6b6853c8993

### Subtitles turn off request

PUT
Media > Part (for part ID)
`https://192-168-2-27.7e69df2cf3a14143b7ecdd7920a07853.plex.direct:32400/library/parts/9321?subtitleStreamID=0d
&X-Plex-Product=Plex%20Web
&X-Plex-Version=4.121.1
&X-Plex-Client-Identifier=191gnhmhql5gnsry9nl1tqql
&X-Plex-Platform=Chrome
&X-Plex-Platform-Version=120.0
&X-Plex-Features=external-media%2Cindirect-media%2Chub-style-list
&X-Plex-Model=hosted
&X-Plex-Device=OSX
&X-Plex-Device-Name=Chrome
&X-Plex-Device-Screen-Resolution=1452x698%2C1680x1050
&X-Plex-Token=6ame655L9SfANxFqQ_tn
&X-Plex-Language=en
&X-Plex-Session-Id=37d49861-5e18-42a8-808e-b223dc0902e5
&X-Plex-Drm=widevine
&X-Plex-Text-Format=plain
&X-Plex-Provider-Version=5.1`

### Update progress

Need to stop (not pause)d! the video player, send the request, then reload the Plex client window. Then hit play again.

`https://192-168-2-27.7e69df2cf3a14143b7ecdd7920a07853.plex.direct:32400/:/progress?time=3000000&key=2264&state=played&identifier=com.plexapp.plugins.library`

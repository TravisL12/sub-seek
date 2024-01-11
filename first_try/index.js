const parseString = require("xml2js").parseString;

const getUrl = async (url) => {
  const result = await fetch(url);
  const str = await result.text();
  parseString(str, (err, result) => {
    result.MediaContainer.Device.forEach((device) => {
      if (device["$"].accessToken === token) {
        console.log(device);
        console.log(device.Connection[0]["$"].uri);
      }
    });
  });
};

const token = "6ame655L9SfANxFqQ_tn";
getUrl(`https://plex.tv/pms/resources?includeHttps=1&X-Plex-Token=${token}`);

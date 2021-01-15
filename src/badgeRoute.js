const axios = require("axios");
const semver = require('semver');
require("dotenv-safe").config();

const unknownImageUrl = `https://img.shields.io/badge/version-unknown-lightgrey.svg?style=flat-square`;
let unknownImage;
const cacheBadgeData = {};

module.exports = async (req, res) => {
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Pragma", "no-cache");
  
    const sendUnknown = async () => {
        if (!unknownImage)
            unknownImage = await axios.get(unknownImageUrl);
        res.status(404).send(unknownImage.data);
    }
  
    if (req.url === "/favicon.ico") {
        console.log('Favicon not available.');
        res.status(404).send({"error": "Favicon not available."});
        return;
    }

    let packageName = req.params.scope + '/' + req.params.package;
  
    let targetTag = 'latest';
    if(req.params.tag) {
        targetTag = req.params.tag;
    }
  
    const versionRequestUrl = `${process.env.ARTIFACTORY_BADGE_URI}${encodeURIComponent(packageName)}`;
    // console.log('versionRequestUrl', versionRequestUrl);
  
    const versionRequestConfig = {
        auth: {
            username: process.env.ARTIFACTORY_BADGE_USERNAME,
            password: process.env.ARTIFACTORY_BADGE_PASSWORD
        }
    };
  
    let versionRequest;
  
    try {
        // console.log('Requesting', packageName, '...');
        console.log(`Requesting ${packageName}@${targetTag} ...`);
        versionRequest = await axios.get(
            versionRequestUrl,
            versionRequestConfig
        );
    } catch (error) {
        console.log(`Request ${packageName}@${targetTag} failed`);
        return await sendUnknown();
    }
  
    const tags = versionRequest.data["dist-tags"];
    // console.log(packageName, tags);
  
    if (!tags) {
        console.log('Tags undefined');
        await sendUnknown();
        return;
    }
  
    const latestDistVersion = tags[targetTag] || targetTag;
    if (!semver.valid(latestDistVersion))
        return await sendUnknown();
  
    const version = latestDistVersion.replace(/-/gi, "--");
    const imageUrl = `https://img.shields.io/badge/version-${version}-green.svg?style=flat-square`;
    if(cacheBadgeData[version] === undefined)
        cacheBadgeData[version] = (await axios.get(imageUrl)).data
    const img = cacheBadgeData[version]
  
    console.log(`${packageName}@${latestDistVersion}`);
    res.status(200).send(img);
    return;
};
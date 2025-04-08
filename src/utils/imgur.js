const { ImgurClient } = require("imgur");
const { createReadStream } = require("fs");
const fs = require("fs")
const client = new ImgurClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});
const uploadImage = async (image) => {
    const imageUploaded = await client.upload({
        image: createReadStream(image.path),
        type: 'stream',
    });
    fs.unlinkSync(image.path);
    return imageUploaded;
}
const uploadVideo = async (video) => {
    const videoUploaded = await client.upload({
        image: createReadStream(video.path),
        type: 'video',
    });
    fs.unlinkSync(video.path);
    return videoUploaded;
}
module.exports = {uploadImage, uploadVideo}

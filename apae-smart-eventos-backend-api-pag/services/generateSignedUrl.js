require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const generateSignedUrl = async (bucketName, filePath) => {
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const [url] = await storage.bucket(bucketName).file(filePath).getSignedUrl(options);

  return url;
};

module.exports = { generateSignedUrl };

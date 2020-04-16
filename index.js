'use strict';

const ibm = require('ibm-cos-sdk');

function buildKey(name, hash) {
  return `${hash}${name}`;
}

function buildUrl(endpoint, bucket, key) {
  return `https://${endpoint}/${bucket}/${key}`;
}

module.exports = {
  init: (config) => {
    const region = config.region || 'us-south';
    const endpoint = `s3.${region}.cloud-object-storage.appdomain.cloud`;

    const cos = new ibm.S3({
      endpoint,
      apiKeyId: config.api_key,
      serviceInstanceId: config.resource_id,
    });
    const { bucket } = config;

    return {
      async upload(file) {
        const key = buildKey(file.name, file.hash);

        await cos
          .putObject({
            ACL: 'public-read',
            Body: Buffer.from(file.buffer, 'binary'),
            Bucket: bucket,
            ContentType: file.mime,
            Key: key,
          })
          .promise();

        /* eslint-disable no-param-reassign */
        file.public_id = key;
        file.url = buildUrl(endpoint, bucket, key);
        /* eslint-enable no-param-reassign */
      },
      async delete(file) {
        const key = buildKey(file.name, file.hash);

        return cos
          .deleteObject({
            Bucket: bucket,
            Key: key,
          })
          .promise();
      },
    };
  },
};

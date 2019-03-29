const aws = require('aws-sdk');

const s3 = new aws.S3();

const getUploadParams = (buffer, agreementId) => ({
  Bucket: 'trustlayer-agreements',
  Key: `${agreementId}.pdf`,
  Body: buffer,
});


const uploadToS3 = (buffer, agreementId) => new Promise((resolve, reject) => {
  const params = getUploadParams(buffer, agreementId);
  s3.putObject(params, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});


module.exports = { uploadToS3 };

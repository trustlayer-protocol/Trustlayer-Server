const aws = require('aws-sdk');

const s3 = new aws.S3();

const getUploadParams = (buffer, agreementId) => ({
  Bucket: 'trustlayer-agreements',
  Key: `${agreementId}.pdf`,
  Body: buffer,
});


const getDownloadParams = agreementId => ({
  Bucket: 'trustlayer-agreements',
  Key: `${agreementId}.pdf`,
});


const getAgreementFromS3 = id => new Promise((resolve, reject) => {
  s3.getObject(getDownloadParams(id), (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
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


module.exports = { uploadToS3, getAgreementFromS3 };

const htmlPdf = require('html-pdf');

const config = {
  format: 'A4',
  header: {
    height: '22mm',
  },
  footer: {
    height: '22mm',
  },
};


const convertToPdf = (html) => {
  const bodyStyling = 'body { padding-left: 50px; padding-right:50px; font-size:11px; }';
  let newHTML = `<html><head><style>${bodyStyling}</style></head><body>${html}</body></html>`;
  newHTML = newHTML.replace(/(\\")/g, '"');

  return new Promise((resolve, reject) => {
    htmlPdf.create(newHTML, config).toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
};


module.exports = convertToPdf;

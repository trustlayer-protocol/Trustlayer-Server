const htmlPdf = require('html-pdf');
const moment = require('moment');

const config = {
  format: 'A4',
  header: {
    height: '22mm',
  },
  footer: {
    height: '22mm',
  },
};


const addLogDataToBody = (agreementBody, linkAdoption, adoption, linkUser, user) => {
  const { full_name: linkUserFullName, email: linkUserEmail } = linkUser;
  const { full_name: userFullName, email: userEmail } = user;

  const {
    form_hash: linkHash,
    ip: linkIp,
    created: linkTimestamp,
  } = linkAdoption;
  const {
    form_hash: hash,
    ip,
    created: timestamp,
  } = adoption;

  const linkDate = moment.unix(linkTimestamp / 1000).format('MMMM Do, YYYY');
  const date = moment.unix(timestamp / 1000).format('MMMM Do, YYYY');

  const linkUserName = linkUserFullName ? `${linkUserFullName}<br/>` : '';
  const userName = userFullName ? `${userFullName}<br/>` : '';

  const logHtml = `
  <br/>
  <div>
    <h2>Adoption logs</h2>
    <div>
      <p>
        ${linkUserName}
        ${linkUserEmail}<br/>
        Adopted: ${linkDate}<br/>
        Public IP address: ${linkIp}<br/>
        Form hash: ${linkHash}<br/>
      </p>
    </div>
    <div>
      <p>
        ${userName}
        ${userEmail}<br/>
        Adopted: ${date}<br/>
        Public IP address: ${ip}<br/>
        Form hash: ${hash}<br/>
      </p>
    </div>
  </div>
  `;

  return agreementBody + logHtml;
};


const convertToPdf = (agreementBody, linkAdoption, adoption, linkUser, user) => {
  const html = addLogDataToBody(agreementBody, linkAdoption, adoption, linkUser, user);

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

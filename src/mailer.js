"use strict";

require('dotenv-defaults').config();

const nodemailer = require("nodemailer");

/**
 * Mails new job opportunities.
 * @param {Array} newJobOpportunities - an array of titles of new job opportunities
 * @return {object} object containing information about sent email
 */
async function mailOpportunities(newJobOpportunities) {
  if (!newJobOpportunities || newJobOpportunities.length == 0) {
    console.log("No new job opportunities to mail about.", newJobOpportunities);
    return;
  }

  // build up HTML body of the email
  let html = "<ul>";
  
  newJobOpportunities.forEach(opportunity => html += '<li>' + opportunity + '</li>');
  
  html += "</ul>";

  // send email
  console.log("Sending email to:",  process.env.MAIL_TO);
  
  return await _mail({
    to: process.env.MAIL_TO,
    subject: "Changes in the EPSO jobs opportunities!",
    text: "There are new job opportunities!",
    html: "<p>There are new job opportunities!</p>" + html + "<a href='" + process.env.URL_TO_CRAWL + "' target='_blank'>Hurry to the website!!!</a>"
  });
}

/**
 * Mails error message to developer.
 * @return {object} object containing information about sent email
 */
async function mailError() {
  return await _mail({
    to: process.env.MAIL_TO_DEVELOPER,
    subject: "EPSO cron error",
    text: "There was an error executing EPSO cron", // plain text body
    html: "<p>There was an error executing EPSO cron ... </p>",
  });
}

/**
 * Internal method. Mails whatever is passed in input.
 * @param {object} sendMailInput - object consisting of "to", "subject", "text" and "html" properties
 * @return {object} object containing information about sent email
 */
async function _mail(sendMailInput) {
  // console.log("mail", arguments);
  console.log("Using SMTP host:", process.env.MAIL_HOST);
  console.log("Using SMTP port:", process.env.MAIL_PORT);
  console.log("Using SMTP login:", process.env.MAIL_USER);

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Vlado\'s EPSO cron 🐤" <foo@example.com>',  // sender address
    to: sendMailInput.to,                               // list of receivers
    subject: sendMailInput.subject,
    text: sendMailInput.text,                           // plain text body
    html: sendMailInput.html                            // HTML body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  return info;
}

module.exports = {
  "mailOpportunities": mailOpportunities,
  "mailError": mailError
};
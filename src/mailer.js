"use strict";

require('dotenv-defaults').config();

const nodemailer = require("nodemailer");

class Mailer {
  /**
   * Set up variables and creates a transporter instance.
   */
  constructor() {
    // Set up variables from env //
    console.log("Using SMTP host:", process.env.MAIL_HOST);
    this.host = process.env.MAIL_HOST;

    console.log("Using SMTP port:", process.env.MAIL_PORT);
    this.port = process.env.MAIL_PORT;

    console.log("Using MAIL_TO:", process.env.MAIL_TO);
    this.mailTo = process.env.MAIL_TO;
    
    console.log("Using MAIL_TO_DEVELOPER:", process.env.MAIL_TO_DEVELOPER);
    this.mailToDeveloper = process.env.MAIL_TO_DEVELOPER;

    console.log("Using SMTP login:", process.env.MAIL_USER);
    this.user = process.env.MAIL_USER;

    this.pass = process.env.MAIL_PASS;
    
    // create an instance of transporter //
    this._createTransporter();
  }
  
  /**
   * Create reusable transporter object using the default SMTP transport
   */
  _createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: false, // true for 465, false for other ports
      auth: {
          user: this.user,
          pass: this.pass,
      },
    });
  }

  /**
   * Verifies the SMTP connection
   */
  verify() {
    this.transporter.verify(function(error, success) {
      if (error) {
        console.log(error);
        throw new Error(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
  }
  
  /**
   * Mails new job opportunities.
   * @param {Array} newJobOpportunities - an array of titles of new job opportunities
   * @return {object} object containing information about sent email
   */
  async mailOpportunities(newJobOpportunities) {
    if (!newJobOpportunities || newJobOpportunities.length == 0) {
      console.log("No new job opportunities to mail about.", newJobOpportunities);
      return;
    }

    // build up HTML body of the email
    let html = "<ul>";
    
    newJobOpportunities.forEach(opportunity => html += '<li>' + opportunity + '</li>');
    
    html += "</ul>";
    
    return await _mail({
      to: this.mailTo,
      subject: "Changes in the EPSO jobs opportunities!",
      text: "There are new job opportunities!",
      html: "<p>There are new job opportunities!</p>" + html + "<a href='" + process.env.URL_TO_CRAWL + "' target='_blank'>Hurry to the website!!!</a>"
    });
  }

  /**
   * Mails error message to developer.
   * @return {object} object containing information about sent email
   */
  async mailError() {
    return await _mail({
      to: this.mailToDeveloper,
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
  async _mail(sendMailInput) {
    // console.log("mail", arguments);

    // send mail with defined transport object
    let info = await this.transporter.sendMail({
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
}

const mailer = new Mailer();

module.exports.mailer = mailer;
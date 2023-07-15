"use strict";

console.log('Loading mailer');

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sesv2/index.html

const { REGION, URL_OBJECT, MAIL_TO, MAIL_TO_DEVELOPER, settings, CITY_SEARCH_PARAM_KEY } = require('./env');

const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

// a client can be shared by different commands.
const client = new SESv2Client({ region: REGION });

class Mailer {
  /**
   * Set up variables and creates a transporter instance.
   */
  constructor() {
    // Set up variables from env //

    this.mailTo = MAIL_TO;
    this.mailToDeveloper = MAIL_TO_DEVELOPER;
  }
  
  /**
   * Mails new job opportunities.
   * @param {object} newJobOpportunities - an object of an array of objects of new job opportunities. 
   *                                          first level is the city code
   *                                          second level is array of new jobs
   *                                          Job opportunity consists of text and link to the job detail.
   * @return {object} object containing information about sent email
   */
  async mailOpportunities(newJobOpportunities) {
    if (!newJobOpportunities || Object.keys(newJobOpportunities).length === 0) {
      console.log("No new job opportunities to mail about.", newJobOpportunities);
      return;
    }

    // build up HTML body of the email

    let jobsHtml = "";

    function findCityByCode(code) {
      settings.cities
    }

    for (const cityCode in newJobOpportunities) {

      const searchedCity = settings.cities.find( (city) => (cityCode == city.code) );

      // console.log("searchedCity", searchedCity);
      URL_OBJECT.searchParams.set(CITY_SEARCH_PARAM_KEY, searchedCity.id)

      jobsHtml += '<h2><a href="' + URL_OBJECT.toString() + '" target="_blank">' + searchedCity.name + '</a></h2>'
      jobsHtml += "<ul>";
      
      newJobOpportunities[cityCode].forEach(opportunity => {
        const jobURL = new URL(opportunity.href, URL_OBJECT.origin);
  
        jobsHtml += '<li><a href="' + jobURL.href + '" target="_blank">' + opportunity.text + '</a></li>'
      });

      jobsHtml += "</ul>";
    }

    const Quote = require('inspirational-quotes');
    
    // return any random quote
    const quoteBody = Quote.getRandomQuote()
    
    return await this._mail({
      to: this.mailTo,
      subject: "Changes in the EPSO jobs opportunities!",
      text: "There are new job opportunities!",
      html: "<p>There are new job opportunities! And here is a quote for the day:</p>"
          + "<p><q>" + quoteBody + "</q></p>"
          + jobsHtml + "<a href='" + URL_OBJECT.origin + URL_OBJECT.pathname + "' target='_blank'>Hurry to the website!!!</a>"
    });
  }

  /**
   * Mails error message to developer.
   * @return {object} object containing information about sent email
   */
  async mailError() {
    return await this._mail({
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
    
    const CHARSET = "UTF-8";

    var params = {
        Destination: {
            // BccAddresses: []
            // CcAddresses: [
            //     "recipient3@example.com"
            // ],
            // ToAddresses: [
            //     "recipient2@example.com",
            //     "recipient2@example.com"
            // ]
            ToAddresses: sendMailInput.to.split(",")
        },
        Content: {
            Simple: {
                Subject: {
                    Charset: CHARSET,
                    Data: sendMailInput.subject
                },
                Body: {
                    Html: {
                        Charset: CHARSET,
                        // Data: "This message body contains HTML formatting. It can, for example, contain links like this one: <a class=\"ulink\" href=\"http://docs.aws.amazon.com/ses/latest/DeveloperGuide\" target=\"_blank\">Amazon SES Developer Guide</a>."
                        Data: sendMailInput.html
                    },
                    Text: {
                        Charset: CHARSET,
                        // Data: "This is the message body in text format."
                        Data: sendMailInput.text
                    }
                },
            }
        },
        // ReplyToAddresses: [],
        // ReturnPath: "",
        // ReturnPathArn: "",
        // FromEmailAddress: '"Vlado\'s EPSO cron 🐤" <no-reply@janevjem.us>'
        FromEmailAddress: '"Vlado\'s EPSO cron" <no-reply@janevjem.us>'
        // FromEmailAddress: "no-reply@janevjem.us"
        // SourceArn: ""
    };
    
    // async/await.
    try {
        const command = new SendEmailCommand(params);

        // console.log("command", command);

        const response = await client.send(command);

        console.log("response", response);
        
        return response;
        // process data.
    } catch (error) {
        // error handling.
        console.error("Message not sent", error);
        throw new Error(error);
    } finally {
        // finally.
        console.log("message sent");
    }
  }
}

module.exports.mailer = new Mailer()
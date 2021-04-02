/**
 * Tests SMTP server connection
 */
async function run () {
    const { mailer } = require('./mailer');

    console.log("Verifying SMTP connection ...");

    const verifyOutput = await mailer.verify();
    
    if (!verifyOutput) {
        console.error(verifyOutput);
        throw new Error(verifyOutput);
    } else {
        console.log("SMTP connection verified successfuly");
    }

    console.log("Sending test email ...");

    const mailOutput = await mailer._mail({
        to: mailer.mailToDeveloper,
        subject: "EPSO cron test",
        text: "Testing",
        html: "Testing",
    });

    if (!mailOutput) {
        console.error(mailOutput);
        throw new Error(mailOutput);
    } else {
        console.log("Test email sent successfuly");
    }
};

module.exports = {
    "run": run
};
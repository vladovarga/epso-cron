/**
 * Tests SMTP server connection
 */
async function run () {
    const { mailer } = require('./mailer');

    console.log("Verifying SMTP connection ...")

    const verifyOutput = await mailer.verify();
    
    if (!verifyOutput) {
        console.error(verifyOutput);
        throw new Error(verifyOutput);
    } else {
        console.log("SMTP connection verified successfuly")
    }
};

module.exports = {
    "run": run
};
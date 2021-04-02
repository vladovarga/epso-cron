/**
 * Tests SMTP server connection
 */
(function () {
    const { mailer } = require('./mailer');

    // console.log(mailer);

    mailer.verify();
}) ();
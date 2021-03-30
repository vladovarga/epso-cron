console.log("Initializing ...");

const init = require('./init');

(async function() {
    console.log("Running crawler");

    const crawl = require('./crawl');

    const crawlOutput = await crawl.run();

    console.log("Running diff");

    const diff = require('./diff');

    const diffs = diff.run();

    const mailer = require('./mailer');
    const { run } = require('./crawl');

    if (!diffs) {
        const message = "There was an error while comparing differences!";
        console.error(message, diffs);
        mailer.mailError();
        throw new Error(message);
    } else if (diffs.length == 0) {
        console.log("There were no new job opportunities");
    } else if (diffs.length > 0) {
        console.log("There are new opportunities!!", diffs);

        console.log("Sending email");

        mailer.mailOpportunities(diffs);
    }

    console.log("Latest list becomes the previous");

    const fs = require('fs');
    
    fs.copyFileSync('downloads/latest.txt', 'downloads/previous.txt');
}) ();
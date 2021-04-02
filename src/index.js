(async function() {
    console.log("Testing ...");

    const test = require('./test');

    await test.run();

    console.log("Initializing ...");

    const init = require('./init');

    const cron = require('node-cron');

    console.log('Used cron expression', process.env.CRON_EXPRESSION);

    const validateOutput = cron.validate(process.env.CRON_EXPRESSION);

    if (!validateOutput) {
        const msg = "Cron expression is not valid!";
        console.error(msg, process.env.CRON_EXPRESSION);
        throw new Error(msg);
    }

    console.log('Cron expression is valid');

    cron.schedule(process.env.CRON_EXPRESSION, () => {
        console.log('Running cron job');

        job();
    }, {
        timezone: "Europe/Bratislava"
    });

    async function job() {
        console.log("Running crawler");

        const crawl = require('./crawl');

        const crawlOutput = await crawl.run();

        console.log("Running diff");

        const diff = require('./diff');

        const diffs = diff.run();

        const mailer = require('./mailer');

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

            await mailer.mailOpportunities(diffs);
        }

        console.log("Latest list becomes the previous");

        const fs = require('fs');
        
        fs.copyFileSync('downloads/latest.txt', 'downloads/previous.txt');
    }
}) ();
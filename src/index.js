(async function() {
    console.log("Testing ...");

    const test = require('./test');

    await test.run();

    console.log("Testing completed.");

    console.log("Initializing ...");

    const init = require('./init');

    await init.run();

    console.log("Initializing completed.");

    const cron = require('node-cron');

    console.log('Used cron expression', process.env.CRON_EXPRESSION);

    const validateOutput = cron.validate(process.env.CRON_EXPRESSION);

    if (!validateOutput) {
        const msg = "Cron expression is not valid!";
        console.error(msg, process.env.CRON_EXPRESSION);
        throw new Error(msg);
    }

    console.log('Cron expression is valid');

    cron.schedule(process.env.CRON_EXPRESSION, async () => {
        console.log('Running cron job');

        await job();

        console.log("Cron job completed.");
    }, {
        timezone: "Europe/Bratislava"
    });

    async function job() {
        console.log("Running crawler ...");

        const crawl = require('./crawl');

        const crawlOutput = await crawl.run();

        console.log("Crawling completed.");

        console.log("Running diff ...");

        const diff = require('./diff');

        const diffs = diff.run();

        console.log("Diff completed.", diffs);

        const { mailer } = require('./mailer');

        if (!diffs) {
            const message = "There was an error while comparing differences!";
            console.error(message, diffs);
            mailer.mailError();
            throw new Error(message);
        } else if (diffs.length == 0) {
            console.log("There were no new job opportunities");
        } else if (diffs.length > 0) {
            console.log("There are new opportunities!!", diffs);

            console.log("Sending emails ... ");

            await mailer.mailOpportunities(diffs);

            console.log("Emails sent.");
        }

        console.log("Latest list becomes the previous");

        const fs = require('fs');
        
        fs.copyFileSync(process.env.DOWNLOADS_PATH + 'latest.txt', process.env.DOWNLOADS_PATH + 'previous.txt');
    }
}) ();
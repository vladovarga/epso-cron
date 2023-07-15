// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html

require('dotenv').config();

const { REGION, BUCKET, LATEST_FILE_NAME, PREVIOUS_FILE_NAME, settings } = require('./env');

exports.handler = async (event) => {
// (async function() {

    // no need for initialization - has been done manually - creating previous.txt, latest.txt, downloads folder

    const { mailer } = require('./mailer');

    // 1. step - Crawl the website
    console.log("Running crawler ...");

    const crawler = require('./crawler');

    console.time("crawler");

    for (let i = 0; i < settings.cities.length; i++) {
        const city = settings.cities[i]

        console.time("crawling-" + city.code)

        const crawlerOutput = await crawler.run(city)

        console.timeEnd("crawling-" + city.code)
    }

    console.timeEnd("crawler");

    console.log("Crawling completed.");

    // 2. step - See if there are some new jobsß
    console.log("Running diff ...");
    
    const diff = require('./diff');

    let diffs = {};

    console.time("diff");

    for (let i = 0; i < settings.cities.length; i++) {
        const city = settings.cities[i]

        const diffOutput = await diff.run(city);

        if (!diffOutput) {
            const message = "There was an error while comparing differences!";
            console.error(message, diffOutput);
            await mailer.mailError();
            throw new Error(message);
        } else if (diffOutput.length == 0) {
            console.log("There were no new job opportunities for city", city.name);
            continue
        } else if (diffOutput.length > 0) {
            console.log("There are new opportunities for city", city.name, diffOutput);
            diffs[city.code] = diffOutput
        }
    }

    console.timeEnd("diff");

    console.log("Diff completed.", diffs);
    
    // 3. step - Send emails

    console.time("emails");

    if (Object.keys(diffs).length > 0) {
        console.log("Sending emails ... ");
        
        await mailer.mailOpportunities(diffs);
        
        console.log("Emails sent.");
    }
    
    console.timeEnd("emails");

    // 4. step - update previous.txt
    console.log("Latest list becomes the previous");
    const { S3Client, CopyObjectCommand } = require("@aws-sdk/client-s3"); // CommonJS
    const s3Client = new S3Client({region: REGION});
    
    console.time("copying");

    for (let i = 0; i < settings.cities.length; i++) {
        const city = settings.cities[i]

        const copyCommand = new CopyObjectCommand({
            Bucket: BUCKET,
            CopySource: BUCKET + "/" + city.code + "/" + LATEST_FILE_NAME,
            Key: city.code + "/" + PREVIOUS_FILE_NAME
        });
        
        const copyResponse = await s3Client.send(copyCommand);
    }
    
    console.timeEnd("copying");
};
// })();
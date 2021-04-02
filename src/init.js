/**
 * Initializes the environment - checks for downloads folder, previous.txt, ...
 */
async function run() {
    require('dotenv-defaults').config();
    const fs = require('fs');

    console.log("Checking if downloads folder exists ...");

    try {
        fs.accessSync(process.env.DOWNLOADS_PATH, fs.constants.R_OK | fs.constants.W_OK);
        console.log('Downloads folder exists!');
    } catch (err) {
        console.info('Downloads folder does not exist! Creating one ...');
        try {
            fs.mkdirSync(process.env.DOWNLOADS_PATH);
        } catch (err) {
            console.error('Downloads folder could not be created!', err);
            throw err;
        }
    }

    console.log("Checking if previous.txt exists ...");

    try {
        fs.accessSync(process.env.DOWNLOADS_PATH + 'previous.txt', fs.constants.R_OK | fs.constants.W_OK);
        console.log('previous.txt file exists!');
    } catch (err) {
        console.info('previous.txt file does not exist! Creating one ...');

        try {
            fs.writeFileSync(process.env.DOWNLOADS_PATH  + 'previous.txt', "");

            // crawl the data for the first time //
            const crawl = require('./crawl');

            const crawlOutput = await crawl.run();

            console.log("Latest list becomes the previous");
            
            fs.copyFileSync(process.env.DOWNLOADS_PATH + 'latest.txt', process.env.DOWNLOADS_PATH + 'previous.txt');
        } catch (err) {
            console.error('previous.txt file could not be created!', err);
            throw err;
        }
    }
}

module.exports = {
    "run": run
};
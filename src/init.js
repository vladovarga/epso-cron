/**
 * Initializes the environment - checks for downloads folder, previous.txt, ...
 */
(function () {
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
        } catch (err) {
            console.error('previous.txt file could not be created!', err);
            throw err;
        }
    }
})();
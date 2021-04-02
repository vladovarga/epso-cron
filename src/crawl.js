/**
 * Returns promise that resolves when the URL is fully loaded and content parsed.
 * @return {Promise}
 */
function getPromise() {
    return new Promise((resolve, reject) => {
        require('dotenv-defaults').config();

        const https = require('https');
        const { mailer } = require('./mailer');

        // start a GET request for URL_TO_CRAWL

        console.log("Crawling URL", process.env.URL_TO_CRAWL);

        https.get(process.env.URL_TO_CRAWL, (response) => {
            // console.log('statusCode:', response.statusCode);
            // console.log('headers:', response.headers);

            if (response.statusCode != 200) {
                const message = "Request didn't finish with 200 reponse code!";
                console.error(message, response.statusCode);
                mailer.mailError();
                // promise rejected on error
                // reject(error);
                throw new Error(message);
            }
            
            console.log('Reponse code was:', response.statusCode);

            let body = "";

            response.on('data', (chunk) => {
                // build up data chunk by chunk
                body += chunk;
            })
            
            response.on('end', function () {
                console.log('Reponse end reached');
                // console.log(body);
                
                // generate fileName from today's date + .html
                let fileName = new Date().toISOString() + '.html';

                const fs = require('fs');

                // write down the response body into a .html file

                console.log('Writing file into:', process.env.DOWNLOADS_PATH + fileName);

                fs.writeFileSync(process.env.DOWNLOADS_PATH + fileName, body, (err) => {
                    if (err) {
                        mailer.mailError();
                        throw err;
                    }
                    console.log('The HTML file has been saved!');
                });

                // create a copy of just downloaded file into latest.html
                
                console.log('Copying file');

                fs.copyFileSync(process.env.DOWNLOADS_PATH + fileName, process.env.DOWNLOADS_PATH + 'latest.html');

                // let's parse latest.html as DOM

                const jsdom = require("jsdom");
                const { JSDOM } = jsdom;

                const dom = new JSDOM(body);
                
                let jobList = "";

                // find all the <a> tags containing a job title

                dom.window.document.querySelectorAll("td.views-field-title-field > a").forEach(a => jobList += a.text + "\n" );

                // write down list of current job opportunities into latest.txt

                console.log('Writing job list to latest.txt');

                fs.writeFileSync(process.env.DOWNLOADS_PATH + 'latest.txt', jobList, (err) => {
                    if (err) {
                        mailer.mailError();
                        throw err;
                    }
                    console.log('The latest.txt file has been saved!');
                });

                // promise resolved on success
                resolve(jobList);
            });
        }).on('error', (e) => {
            mailer.mailError();
            console.error(e);
        });
    });
}

/**
 * Async wrapper for the promise.
 * @return {string} returns a simple string containing the latest list of available jobs
 */
async function run() {
    return await getPromise();
}

module.exports = {
    "run": run
};
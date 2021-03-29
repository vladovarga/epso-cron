require('dotenv-defaults').config();

const https = require('https');
const mailer = require('./mailer');

// start a GET request for URL_TO_CRAWL

https.get(process.env.URL_TO_CRAWL, (response) => {
    // console.log('statusCode:', response.statusCode);
    // console.log('headers:', response.headers);

    if (response.statusCode != 200) {
        const message = "Request didn't finish with 200 reponse code!";
        console.error(message, response.statusCode);
        mailer.mailError();
        throw new Error(message);
    }
    
    let body = "";

    response.on('data', (chunk) => {
        // build up data chunk by chunk
        body += chunk;
    })
    
    response.on('end', function () {
        // console.log(body);
        
        // generate fileName from today's date
        let fileName = new Date().toISOString();

        const fs = require('fs');

        // write down the response body into a .html file

        fs.writeFileSync('downloads/' + fileName + '.html', body, (err) => {
            if (err) {
                mailer.mailError();
                throw err;
            }
            console.log('The HTML file has been saved!');
        });

        // create a copy of just downloaded file into latest.html
        
        fs.copyFileSync('downloads/' + fileName + '.html', 'downloads/latest.html');

        // let's parse latest.html as DOM

        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;

        const dom = new JSDOM(body);
        
        let jobList = "";

        // find all the <a> tags containing a job title

        dom.window.document.querySelectorAll("td.views-field-title-field > a").forEach(a => jobList += a.text + "\n" );

        // write down list of current job opportunities into latest.txt

        fs.writeFileSync('downloads/latest.txt', jobList, (err) => {
            if (err) {
                mailer.mailError();
                throw err;
            }
            console.log('The latest.txt file has been saved!');
        });
    });
}).on('error', (e) => {
    mailer.mailError();
    console.error(e);
});
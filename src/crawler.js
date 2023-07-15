// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/

console.log('Loading crawler');

const { JSDOM } = require("jsdom")
const https = require('https');

const { REGION, BUCKET, DOWNLOADS_PATH, URL_OBJECT, LATEST_FILE_NAME, CITY_SEARCH_PARAM_KEY } = require('./env');

const { S3Client, CopyObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3"); // CommonJS
const s3Client = new S3Client({region: REGION});

const { mailer } = require('./mailer');

// where are the jobs located in the html source code
const JOBS_TITLE_SELECTOR = "td.views-field-title > a";
const GRADES_SELECTOR = "td.views-field-field-epso-grade";

// this text can be found in the body if there are no jobs available
const NO_JOBS_TEXT = "Sorry, there are no jobs"

/**
 * Returns promise that resolves when the URL is fully loaded and content parsed.
 * @return {Promise}
 */
function getPromise(cityObj) {
    return new Promise((resolve, reject) => {
        URL_OBJECT.searchParams.set(CITY_SEARCH_PARAM_KEY, cityObj.id)
        
        console.log("Crawling URL", URL_OBJECT.toString());
        
        // start a GET request for URL_OBJECT
        
        https.get(URL_OBJECT, async (response) => {
            // console.log('statusCode:', response.statusCode);
            // console.log('headers:', response.headers);

            if (response.statusCode != 200) {
                const message = "Request didn't finish with 200 reponse code!";
                console.error(message, response.statusCode);
                await mailer.mailError();
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
            
            response.on('end', async function () {
                console.log('Reponse end reached');
                // console.log(body);
                
                // generate fileName from today's date + .html
                let fileName = cityObj.code + "-" + new Date().toISOString() + '.html';

                // write down the response body into a .html file

                console.log('Writing file into:', DOWNLOADS_PATH + fileName);
                
                console.time("saving-"+fileName)

                const putCommand = new PutObjectCommand({
                    Bucket: BUCKET, 
                    Key: DOWNLOADS_PATH + fileName, 
                    Body: body
                });

                // const putResponse = await s3Client.send(putCommand);
                s3Client.send(putCommand).then((data) => {
                    console.log('Writing successful');

                    // create a copy of just downloaded file into latest.html
                    console.log('Copying file into latest.html');
                    
                    console.time("copying-"+fileName)

                    const copyCommand = new CopyObjectCommand({
                        Bucket: BUCKET, 
                        CopySource: BUCKET + "/" + DOWNLOADS_PATH + fileName,
                        Key: cityObj.code + "/" + 'latest.html'
                    });
                    
                    // const copyResponse = await s3Client.send(copyCommand)
                    s3Client.send(copyCommand)

                    console.timeEnd("copying-"+fileName)

                    console.log('Copying successful');
                  })
                  .catch((error) => {
                    // error handling.
                    console.error("There was an error saving the lastest html file!", error)
                  })

                console.timeEnd("saving-"+fileName)                

                // let's parse latest.html as DOM
                
                console.log('Preparing to parse job list');
                
                let jobList = ""           // plain text list
                let result = []            // array of objects

                if (body.includes(NO_JOBS_TEXT)) {
                    console.log('No jobs text found => skipping parsing via jsdom')
                } else {
                    console.time("initializing-jsdom");

                    const dom = new JSDOM(body);
                    
                    console.timeEnd("initializing-jsdom");
    
                    // find all the <a> tags containing a job title
                    
                    console.time("parsing");
                    
                    let grades = dom.window.document.querySelectorAll(GRADES_SELECTOR)

                    dom.window.document.querySelectorAll(JOBS_TITLE_SELECTOR).forEach(function(a, index) {
                        jobList += a.text + " (" + grades[index].textContent.trim() + ")" + "|" + a.href + "\n";
                        result.push({
                            "text": a.text,
                            "href": a.href,
                        });
                    });

                    console.timeEnd("parsing");
                    console.log('Parsing successful');
                }

                // write down list of current job opportunities into latest.txt

                console.log('Writing job list to:', LATEST_FILE_NAME);
                
                console.time("saving-"+LATEST_FILE_NAME);

                const putCommand2 = new PutObjectCommand({
                    Bucket: BUCKET,
                    Key:  cityObj.code + "/" + LATEST_FILE_NAME, 
                    Body: jobList
                });

                // const putResponse2 = await s3Client.send(putCommand2);
                s3Client.send(putCommand2).then((data) => {
                    // process data.
                    console.log('The latest.txt file has been saved!');
                })
                .catch((error) => {
                    // error handling.
                    console.error('The latest.txt could not be saved!', error);
                })

                console.timeEnd("saving-"+LATEST_FILE_NAME);                

                // promise resolved on success
                resolve(result);
            });
        }).on('error', async (e) => {
            await mailer.mailError();
            console.error(e);
        });
    });
}

/**
 * Async wrapper for the promise.
 * @return {string} returns a simple string containing the latest list of available jobs
 */
module.exports.run = async function run(cityObj) {
    return await getPromise(cityObj);
}
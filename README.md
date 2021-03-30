# EPSO cron
Cron job that checks regularly the EPSO website for new job opportunities and emails you if something new appears...

## Configuration

Settings are defined as env variables. They can be defined using an .env file or .env.defaults file.

* CRON_EXPRESSION - cron expression to define how often the crawler should run
* URL_TO_CRAWL - URL to be crawled

### mail settings

* MAIL_USER - user name for the SMTP server
* MAIL_PASS - password for the SMTP server
* MAIL_TO - email addresses to notify. Separated by comma
* MAIL_TO_DEVELOPER - developer email addresses to notify when an error occurs. Separated by comma
const express = require('express');
const app = express();
const os = require('os');
const ifaces = os.networkInterfaces();
const colors = require('colors/safe');
const utils = require('./utils');
const logger = utils.logger;
const with_lt_server = process.env.SERVER_MODE ? process.env.SERVER_MODE == 'lt' : false;

app.set('view engine', 'ejs');
app.use("/", express.static(__dirname + '/views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', (req, res) => {
    utils.multer_upload(req, res, err => {
        if (err) {
            return res.end("Something went wrong:(");
        };
        res.end("Upload completed.");
    });
});

let port = 9000;
let protocol = 'http://';

app.listen(port, function () {
    logger.info([colors.yellow('Starting up http-file-upload'),
    colors.yellow('\nAvailable on:')
    ].join(''));
    Object.keys(ifaces).forEach(dev => {
        ifaces[dev].forEach(details => {
            if (details.family === 'IPv4') {
                logger.info(('  ' + protocol + details.address + ':' + colors.green(port.toString())));
            }
        });
    });
    if (with_lt_server) {
        const subdomain = 'yellowtruck';
        utils.connectLocaltunnel(port, subdomain)
    };
});
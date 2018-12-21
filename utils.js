
const localtunnel = require('localtunnel');
const multer = require('multer');
const fs = require('fs');
const colors = require('colors/safe');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const multer_upload = multer({ storage: storage }).array('files', 12);

const checkInternetConnect = (callback) => {
    const exec = require('child_process').exec;
    exec('ping -c 1 google.com', function (error, stdout, stderr) {
        callback(!error);
    });
};

const logger = {
    info: console.log,
    request: function (req, res, error) {
        const date = utc ? new Date().toUTCString() : new Date();
        if (error) {
            logger.info(
                '[%s] "%s %s" Error (%s): "%s"',
                date, colors.red(req.method), colors.red(req.url),
                colors.red(error.status.toString()), colors.red(error.message)
            );
        }
        else {
            logger.info(
                '[%s] "%s %s" "%s"',
                date, colors.cyan(req.method), colors.cyan(req.url),
                req.headers['user-agent']
            );
        }
    }
};

const connectLocaltunnel = (port, subdomain) => {
    checkInternetConnect(isConnected => {
        if (isConnected) {
            const options = {};
            if (subdomain) {
                options.subdomain = subdomain;
            };
            localtunnel(port, options, (error, _tunnel) => {
                if (error) {
                    return logger.info(colors.red(error));
                };
                logger.info(colors.green(_tunnel.url));
            }).on('error', error => {
                logger.info(colors.red('Tunnel url Error.'));
                logger.info(colors.red(error));
            }).on('close', function () {
                logger.info(colors.red('Tunnel url closed.'));
            });
        } else {
            logger.info(colors.red("Internet connection is not connected, Server is working but local tunnel is not working."));
        };
    });
};

module.exports = {
    multer_upload,
    checkInternetConnect,
    logger,
    connectLocaltunnel
};
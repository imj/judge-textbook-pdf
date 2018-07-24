const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const rimraf = require('rimraf');
const renderToPdf = require('./src/render-to-pdf');
const languages = require('./src/available-languages');

AWS.config.update({region: 'eu-west-1'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const OUTPUT_DIR = `${__dirname}/output`;

function clearOutput() {
    return new Promise(resolve => rimraf(`${OUTPUT_DIR}/*`, resolve));
}

function uploadToS3(file) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(file);
        fileStream.on('error', reject);

        const uploadParams = {
            Bucket: 'judge-candidate-textbook-pdf',
            ACL: 'public-read',
            Key: path.basename(file).replace(/\s/g, '-'),
            Body: fileStream,
        };

        // call S3 to retrieve upload file to specified bucket
        console.log('Uploading ', file); //eslint-disable-line
        s3.upload(uploadParams, function(err, data) {
            if (err) {
                return reject(err);
            }

            console.log('Upload Success', data.Location); //eslint-disable-line
            resolve(data.Location);
        });
    });
}

const run = async () => {
    await clearOutput();

    for (const language of languages) {
        const fileWithImages = await renderToPdf({
            language,
            showCardImages: true,
            output: `Textbook ${language}.pdf`,
        });
        await uploadToS3(fileWithImages);

        const fileWithoutImages = await renderToPdf({
            language,
            showCardImages: false,
            output: `Textbook ${language} light.pdf`,
        });
        await uploadToS3(fileWithoutImages);

        console.log(`${language} Textbook completed`); //eslint-disable-line
    }
};

run();

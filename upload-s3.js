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
        s3.upload(uploadParams, function(err, data) {
            if (err) {
                return reject(err);
            }

            console.log('Upload Success', data.Location);
            resolve(data.Location);
        });
    });
}

function uploadDirectoryToS3(dir) {
    return fs
        .readdirSync(dir)
        .filter(f => f.indexOf('Textbook') === 0)
        .map(file => uploadToS3(`${dir}/${file}`));
}

const run = async () => {
    await clearOutput();

    for (let language of languages) {
        await Promise.all([
            renderToPdf({
                language,
                showCardImages: true,
                output: `Textbook ${language}.pdf`,
            }),
            renderToPdf({
                language,
                showCardImages: false,
                output: `Textbook ${language} light.pdf`,
            }),
        ]);
    }

    // const requests = languages
    //     .map(language => [
    //         renderToPdf({
    //             language,
    //             showCardImages: true,
    //             output: `Textbook ${language}.pdf`,
    //         }),
    //         renderToPdf({
    //             language,
    //             showCardImages: false,
    //             output: `Textbook ${language} light.pdf`,
    //         }),
    //     ])
    //     // flat array
    //     .reduce((a, b) => a.concat(b));

    // await Promise.all(requests);

    await uploadDirectoryToS3(OUTPUT_DIR);
};

run();

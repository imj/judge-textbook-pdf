const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const getContainer = require('./container');
const fetchContents = require('./contents');

module.exports = async function(options) {
    const langCode = options.language === 'EN' ? '' : `${options.language}:`;
    const TMP_FILE = `/tmp/${Date.now()}.html`;
    const PDF_FILE = path.resolve(options.output);

    const contents = await fetchContents(langCode);
    const container = await getContainer();

    contents.forEach(content => container('body').append(content));

    fs.writeFileSync(TMP_FILE, container.html());
    console.log('Apro con Chromium: ', TMP_FILE); //eslint-disable-line

    // Generate PDF with chrome
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`file://${TMP_FILE}`);

    console.log('Genero il pdf'); //eslint-disable-line
    await page.pdf({
        path: PDF_FILE,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '2cm',
            right: '1cm',
            bottom: '1.5cm',
            left: '1cm',
        },
    });

    await browser.close();

    fs.unlinkSync(TMP_FILE);
};

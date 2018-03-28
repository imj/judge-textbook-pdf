const cheerio = require('cheerio');
const request = require('request-promise');
const contents = require('./textbook-index.json');

async function getPageContent(url) {
    const response = await request(`${url}&printable=yes`);

    const $ = cheerio.load(response);

    // Clear some useless tags
    $('.printfooter').remove();
    $('.language').remove();
    $('.links + p + hr + p').remove();
    $('.links + p + hr').remove();
    $('.links + p').remove();
    $('.links')
        .prev()
        .remove();
    $('.links').remove();
    $('img.cardzoomer').attr('style', '');

    console.log('Caricata pagina ', url);

    return $('#bodyContent')
        .html()
        .replace(
            /(src|href)="\/wiki/g,
            '$1="http://test.italianmagicjudges.net/wiki'
        )
        .replace(
            /javascript:autoCardWindow\(&apos;([^)]+)&apos;\)/g,
            'http://gatherer.wizards.com/Pages/Card/Details.aspx?name=$1'
        );
}

function fetchContents(langCode) {
    return Promise.all(
        contents
            .map(url => url.replace('__LANG__', langCode))
            .map(url => getPageContent(url))
    );
}

module.exports = fetchContents;

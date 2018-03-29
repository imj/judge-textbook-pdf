const crypto = require('crypto');
const cheerio = require('cheerio');
const request = require('request-promise');
const contents = require('./textbook-index.json');

const BASE_URL = 'http://test.italianmagicjudges.net/wiki';

async function getPageContent(url, showCardImages) {
    const response = await request(`${url}&printable=yes`);
    console.log('Caricata pagina ', url); //eslint-disable-line

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

    if (showCardImages) {
        $('img.cardzoomer').attr('style', '');
    } else {
        $('img.cardzoomer').remove();
    }

    $('#mw-content-text')
        .attr('id', '')
        .prev('h1')
        .attr('id', hashUrl(url));

    return $('#bodyContent')
        .html()
        .replace(/src="\/wiki/g, `src="${BASE_URL}`)
        .replace(
            /href="\/wiki([^"]+)"/g,
            (_, url) => `href="#${hashUrl(BASE_URL + url)}"`
        )
        .replace(
            /javascript:autoCardWindow\(&apos;([^)]+)&apos;\)/g,
            'http://gatherer.wizards.com/Pages/Card/Details.aspx?name=$1'
        );
}

function hashUrl(url) {
    return (
        'JCT' +
        crypto
            .createHash('md5')
            .update(url)
            .digest('hex')
    );
}

function fetchContents(langCode, showCardImages) {
    return Promise.all(
        contents
            .map(url => url.replace('__LANG__', langCode))
            .map(url => getPageContent(url, showCardImages))
    );
}

module.exports = fetchContents;

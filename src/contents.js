const crypto = require('crypto');
const cheerio = require('cheerio');
const request = require('request-promise');
const contents = require('./textbook-index.json');

const BASE_URL = 'http://test.italianmagicjudges.net/wiki';
const DEFAULT_LANG = 'EN';

async function getPageContent(page, langCode, showCardImages) {
    var response;
    var url;
    try {
        url = page.replace('__LANG__', getLangCode(langCode));
        response = await request(`${url}&printable=yes`);
        console.log('Caricata pagina ', url); //eslint-disable-line
    } catch (e) {
        if (e.statusCode === 404) {
            url = page.replace('__LANG__', getLangCode(DEFAULT_LANG));
            response = await request(`${url}&printable=yes`);
            console.log('Caricata pagina ', url); //eslint-disable-line
        } else {
            throw e;
        }
    }

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

function getLangCode(lang) {
    return lang === 'EN' ? '' : `${lang}:`;
}

function fetchContents(langCode, showCardImages) {
    return Promise.all(
        contents.map(url => getPageContent(url, langCode, showCardImages))
    );
}

module.exports = fetchContents;

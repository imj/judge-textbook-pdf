const crypto = require('crypto');
const cheerio = require('cheerio');
const axios = require('axios');
const contents = require('./textbook-index.json');

const BASE_URL = 'http://test.italianmagicjudges.net/wiki';
const DEFAULT_LANG = 'EN';

const DATA_CACHE = {};

async function fetchPageWithCache(url) {
    if (DATA_CACHE[url]) {
        // console.log('Cache hit ', url); //eslint-disable-line
        return DATA_CACHE[url];
    }

    // console.log('Downloading page ', url); //eslint-disable-line
    const response = await axios.get(url);
    DATA_CACHE[url] = response;
    return response;
}

async function getPageContent(page, langCode, showCardImages) {
    var response;
    var url;

    try {
        url = page.replace('__LANG__', getLangCode(langCode));
        response = await fetchPageWithCache(`${url}&printable=yes`);
    } catch (e) {
        if (e.response.status === 404) {
            url = page.replace('__LANG__', getLangCode(DEFAULT_LANG));
            response = await fetchPageWithCache(`${url}&printable=yes`);
        } else {
            throw e;
        }
    }

    const $ = cheerio.load(response.data);

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

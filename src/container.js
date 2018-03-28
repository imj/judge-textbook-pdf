const fs = require('fs');
const cheerio = require('cheerio');

function getContainer() {
    const content = fs.readFileSync(`${__dirname}/../static/template.html`);
    return cheerio.load(content);
}

module.exports = getContainer;

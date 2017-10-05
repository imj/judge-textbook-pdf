const fs = require('fs');
const request = require('request-promise');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const http = require('http');

async function getPageContent(url) {
    const response = await request(`${url}&printable=yes`);

    const $ = cheerio.load(response);

    // Clear some useless tags
    $('.printfooter').remove();
    $('.language').remove();
    $('.links + p + hr + p').remove();
    $('.links + p + hr').remove();
    $('.links + p').remove();
    $('.links').prev().remove();
    $('.links').remove();

    // According with style, .example img are not shown
    $('.example img').remove();

    console.log('Caricata pagina ', url);

    return $('#bodyContent').html()
        .replace(/(src|href)="\/wiki/g, '$1="http://test.italianmagicjudges.net/wiki')
        .replace(/javascript:autoCardWindow\(&apos;([^)]+)&apos;\)/g, 'http://gatherer.wizards.com/Pages/Card/Details.aspx?name=$1');
}

async function getContainer() {
    const response = await request(`http://test.italianmagicjudges.net/wiki/index.php?title=IT:Summary&printable=yes`);

    const $ = cheerio.load(response);

    // Clear contents
    $('#main').empty();
    $('script').remove();
    return $;
}

async function init() {
    return Promise.all([
        getPageContent('http://test.italianmagicjudges.net/wiki/index.php?title=IT:Game_basics'),
        getPageContent('http://test.italianmagicjudges.net/wiki/index.php?title=IT:Cards'),
        getPageContent('http://test.italianmagicjudges.net/wiki/index.php?title=IT:Colors,_mana_and_costs'),
    ])
    .then(async (bodies) => {
        const container = await getContainer();

        bodies.forEach(function(body) {
            container('#main').append(body);
        });

        const TMP_FILE = `/tmp/${Date.now()}.html`;

        fs.writeFileSync(TMP_FILE, container.html());
        return TMP_FILE;
    })
    .then(async (file) => {
        const pdfFile = file.replace('.html', '.pdf');

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        console.log('Apro con Chromium: ', file)
        await page.goto('file://' + file);
        console.log('Genero il pdf')
        await page.pdf({
            path: pdfFile,
            format: 'A4',
            margin: {
                top: '2cm',
                right: '1cm',
                bottom: '1.5cm',
                left: '1cm'
            }
        });

        await browser.close();

        return pdfFile;
    })
    .catch(error => console.error(error));
}

http.createServer(async function (req, res) {
    const pdfFile = await init();

    var rstream = fs.createReadStream(pdfFile);
    rstream.pipe(res);
}).listen(process.env.PORT || 8000);
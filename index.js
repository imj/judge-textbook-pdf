#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
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
    $('img.cardzoomer').attr('style', '');

    console.log('Caricata pagina ', url);

    return $('#bodyContent').html()
        .replace(/(src|href)="\/wiki/g, '$1="http://test.italianmagicjudges.net/wiki')
        .replace(/javascript:autoCardWindow\(&apos;([^)]+)&apos;\)/g, 'http://gatherer.wizards.com/Pages/Card/Details.aspx?name=$1');
}

function getContainer() {
    const content = fs.readFileSync(`${__dirname}/container.html`);
    const $ = cheerio.load(content);
    return $;
}

function getContents(langCode) {
    return Promise.all([
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Foreword`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Introduction`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Summary`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Game_basics`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Cards`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Colors,_mana_and_costs`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Card_types`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Lands`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Creatures`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Instants_and_sorceries`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Enchantments`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Artifacts`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Planeswalkers`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Golden_rules`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Game_structure`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Game_zones`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Phases_and_steps`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Beginning_phase`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Main_phase`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Combat_phase`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Ending_phase`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}On_the_stack`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Casting_a_spell`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Resolving_spells`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Countering_spells`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Changing_targets`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Abilities_and_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Abilities`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Activated_abilities`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Static_abilities`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Mana_abilities`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}One-shot_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Continuous_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Replacement_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Prevention_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Redirection_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Regeneration_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Enter-the-battlefield_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Effects_with_special_rules`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Copy_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Type-changing_effects`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Power_and_toughness_modifiers`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Protection`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Layers`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}The_game_in_slow_motion`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Timing_and_priority`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Triggered_abilities`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}State-based_actions`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Special_actions`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Judging_tournaments`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Infractions_at_Regular_REL`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Common_issues`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Unwanted_behaviors`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Serious_problems`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Tournament_rules`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Match_structure`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Tournament_structure`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Formats`),
        getPageContent(`http://test.italianmagicjudges.net/wiki/index.php?title=${langCode}Two-Headed_Giant`),
    ]);
}

async function init(lang, output) {
    const langCode = lang === 'EN' ? '' : `${lang}:`;
    const TMP_FILE = `/tmp/${Date.now()}.html`;
    const PDF_FILE = path.resolve(output);

    const contents = await getContents(langCode);
    const container = await getContainer();

    contents.forEach(content => container('body').append(content));

    fs.writeFileSync(TMP_FILE, container.html());

    // Generate PDF with chrome
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log('Apro con Chromium: ', TMP_FILE);
    await page.goto(`file://${TMP_FILE}`);
    console.log('Genero il pdf')
    await page.pdf({
        path: PDF_FILE,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '2cm',
            right: '1cm',
            bottom: '1.5cm',
            left: '1cm'
        }
    });

    await browser.close();

    fs.unlinkSync(TMP_FILE);
}

init('IT', `${__dirname}/output.pdf`)
    .catch(e => {
        console.error(e);
        process.exit(1);
    });

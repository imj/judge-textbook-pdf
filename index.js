#!/usr/bin/env node
const inquirer = require('inquirer');
const renderToPdf = require('./src/render-to-pdf');
const languages = require('./src/available-languages');

const prompt = inquirer.createPromptModule();

prompt([
    {
        name: 'language',
        type: 'list',
        message: 'Choose the language for Textbook',
        choices: languages,
    },
    {
        name: 'showCardImages',
        type: 'confirm',
        message: 'Do you want card images of examples?',
        default: true,
    },
    {
        name: 'output',
        type: 'input',
        message: 'Specify output file name for your pdf',
        default: answers => `Textbook ${answers.language}.pdf`,
    },
])
    .then(answers => renderToPdf(answers))
    .catch(e => {
        console.error(e); //eslint-disable-line
        process.exit(1);
    });

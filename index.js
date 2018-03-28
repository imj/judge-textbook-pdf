#!/usr/bin/env node
const inquirer = require('inquirer');
const renderToPdf = require('./src/render-to-pdf');

const prompt = inquirer.createPromptModule();

prompt([
    {
        name: 'language',
        type: 'list',
        message: 'Choose the language for Textbook',
        choices: ['IT', 'EN', 'FR', 'PT', 'RU'],
    },
    {
        name: 'output',
        type: 'input',
        message: 'Specify output file for your pdf',
        default: answers => `${__dirname}/Textbook ${answers.language}.pdf`,
    },
])
    .then(answers => renderToPdf(answers.language, answers.output))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });

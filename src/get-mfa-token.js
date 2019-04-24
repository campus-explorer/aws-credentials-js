const inquirer = require('inquirer');

const prompt = inquirer.createPromptModule({ output: process.stderr });

const getMfaToken = async serial =>
    prompt({
        name: 'token',
        type: 'input',
        default: '',
        message: `MFA token for ${serial}:`,
    });

module.exports = getMfaToken;

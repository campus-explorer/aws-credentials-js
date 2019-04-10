const inquirer = require('inquirer');

const getMfaToken = async serial =>
    inquirer.prompt({
        name: 'token',
        type: 'input',
        default: '',
        message: `MFA token for ${serial}:`,
    });

module.exports = getMfaToken;

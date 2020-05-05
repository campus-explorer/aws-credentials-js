/*

Most of this code is ported from
node_modules/aws-sdk/lib/credentials/shared_ini_file_credentials.js.

*/

const AWS = require('aws-sdk');
const memoize = require('memoizee');

/**
 * @typedef {Record<string, Record<string,string>>} IniFileContent
 */

const configOptInEnv = 'AWS_SDK_LOAD_CONFIG';
const sharedConfigFileEnv = 'AWS_CONFIG_FILE';
const sharedCredentialsFileEnv = 'AWS_SHARED_CREDENTIALS_FILE';

/** @type {() => IniFileContent} */
const getProfileConfigs = memoize(() => {
    const iniLoader = new AWS.IniLoader();
    let profilesFromConfig = {};

    if (process.env[configOptInEnv]) {
        profilesFromConfig = iniLoader.loadFrom({
            isConfig: true,
            filename: process.env[sharedConfigFileEnv],
        });
    }

    const profilesFromCreds = iniLoader.loadFrom({
        filename:
            process.env[configOptInEnv] &&
            process.env[sharedCredentialsFileEnv],
    });

    return { ...profilesFromConfig, ...profilesFromCreds };
});

/** @type {(profileConfigs: IniFileContent, profile: string) => void} */
const assertProfileExists = (profileConfigs, profile) => {
    const profileConfig = profileConfigs[profile] || {};

    if (Object.keys(profileConfig).length === 0) {
        throw new Error(`Profile ${profile} not found`);
    }
};

/** @type {(profile:string) => Record<string,string>} */
const getProfileConfig = memoize((profile) => {
    const profileConfigs = getProfileConfigs();
    assertProfileExists(profileConfigs, profile);
    return profileConfigs[profile];
});

module.exports = getProfileConfig;

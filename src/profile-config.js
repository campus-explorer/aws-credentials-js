/*

Most of this code is ported from
node_modules/aws-sdk/lib/credentials/shared_ini_file_credentials.js.

*/

const AWS = require('aws-sdk');
const memoize = require('memoizee');

const getProfileConfigs = memoize(() => {
    const { iniLoader } = AWS.util;
    const profiles = {};
    let profilesFromConfig = {};

    if (process.env[AWS.util.configOptInEnv]) {
        profilesFromConfig = iniLoader.loadFrom({
            isConfig: true,
            filename: process.env[AWS.util.sharedConfigFileEnv],
        });
    }

    const profilesFromCreds = iniLoader.loadFrom({
        filename:
            process.env[AWS.util.configOptInEnv] &&
            process.env[AWS.util.sharedCredentialsFileEnv],
    });
    for (
        let i = 0, profileNames = Object.keys(profilesFromConfig);
        i < profiles.length;
        i++
    ) {
        profiles[profileNames[i]] = profilesFromConfig[profileNames[i]];
    }

    for (
        let i = 0, profileNames = Object.keys(profilesFromCreds);
        i < profileNames.length;
        i++
    ) {
        profiles[profileNames[i]] = profilesFromCreds[profileNames[i]];
    }

    return profiles;
});

const assertProfileExists = (profileConfigs, profile) => {
    const profileConfig = profileConfigs[profile] || {};

    if (Object.keys(profileConfig).length === 0) {
        throw AWS.util.error(new Error(`Profile ${profile} not found`), {
            code: 'SharedIniFileCredentialsProviderFailure',
        });
    }
};

const getProfileConfig = memoize(profile => {
    const profileConfigs = getProfileConfigs();
    assertProfileExists(profileConfigs, profile);
    return profileConfigs[profile];
});

module.exports = getProfileConfig;

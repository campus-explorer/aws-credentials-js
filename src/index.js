process.env.AWS_SDK_LOAD_CONFIG = 1;

const assert = require('assert');
const AWS = require('aws-sdk');
const getTtl = require('./get-ttl');
const defaultGetMfaToken = require('./get-mfa-token');
const withCache = require('./cache');
const getCredentials = require('./get-credentials');

const defaultCacheDir = `${process.env.HOME}/.aws/cli/cache`;

const getProfileCredentials = (
    profile,
    {
        cacheDir = defaultCacheDir,
        duration: specifiedDuration,
        getMfaToken = defaultGetMfaToken,
    } = {},
) => {
    assert(profile, 'getProfileCredentials(): no profile provided');
    const duration = specifiedDuration ? specifiedDuration : getTtl(profile);
    return withCache(getCredentials)({
        profile,
        cacheDir,
        duration,
        getMfaToken,
    });
};

const useProfile = async args => {
    const credentials = await getProfileCredentials(args);
    const { accessKeyId, secretAccessKey, sessionToken } = credentials;
    AWS.config.credentials.accessKeyId = accessKeyId;
    AWS.config.credentials.secretAccessKey = secretAccessKey;
    AWS.config.credentials.sessionToken = sessionToken;
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
    process.env.AWS_SESSION_TOKEN = sessionToken;
};

module.exports = {
    getProfileCredentials,
    useProfile,
};

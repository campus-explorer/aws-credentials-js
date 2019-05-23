process.env.AWS_SDK_LOAD_CONFIG = 1;

const assert = require('assert');
// eslint-disable-next-line no-unused-vars
const AWS = require('aws-sdk');
const getTtl = require('./get-ttl');
const defaultGetMfaToken = require('./get-mfa-token');
const withCache = require('./cache');
const getCredentials = require('./get-credentials');
const getProfileConfig = require('./profile-config');

const defaultCacheDir = `${process.env.HOME}/.aws/cli/cache`;

const getProfileCredentials = (profile, options = {}) => {
    const {
        cacheDir = defaultCacheDir,
        duration: specifiedDuration,
        getMfaToken = defaultGetMfaToken,
    } = options;

    assert(profile, 'getProfileCredentials(): no profile provided');
    const duration = specifiedDuration ? specifiedDuration : getTtl(profile);
    return withCache(getCredentials)({
        profile,
        cacheDir,
        duration,
        getMfaToken,
    });
};

const useProfile = async (profile, AWS, options) => {
    const credentials = await getProfileCredentials(profile, options);
    const { accessKeyId, secretAccessKey, sessionToken } = credentials;
    AWS.config.credentials = {
        ...(AWS.config.credentials || {}),
        accessKeyId,
        secretAccessKey,
        sessionToken,
    };
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
    process.env.AWS_SESSION_TOKEN = sessionToken;
};

module.exports = {
    getProfileCredentials,
    getProfileConfig,
    useProfile,
};

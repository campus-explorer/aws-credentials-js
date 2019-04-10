const AWS = require('aws-sdk');
const getProfileConfig = require('./profile-config');

const getStaticCredentials = profile => {
    const {
        aws_access_key_id: accessKeyId,
        aws_secret_access_key: secretAccessKey,
        aws_session_token: sessionToken,
    } = getProfileConfig(profile);

    if (!accessKeyId || !secretAccessKey) {
        throw AWS.util.error(
            new Error(`Credentials not set for profile ${profile}`),
            { code: 'SharedIniFileCredentialsProviderFailure' },
        );
    }

    return {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken && { sessionToken }),
    };
};

module.exports = getStaticCredentials;

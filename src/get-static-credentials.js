const getProfileConfig = require('./profile-config');

/**
 * @type {(profile: string) => {
 *     accessKeyId: string,
 *     secretAccessKey: string,
 *     sessionToken?: string,
 * }}
 */
const getStaticCredentials = (profile) => {
    const {
        aws_access_key_id: accessKeyId,
        aws_secret_access_key: secretAccessKey,
        aws_session_token: sessionToken,
    } = getProfileConfig(profile);

    if (!accessKeyId || !secretAccessKey) {
        throw new Error(`Credentials not set for profile ${profile}`);
    }

    return {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken && { sessionToken }),
    };
};

module.exports = getStaticCredentials;

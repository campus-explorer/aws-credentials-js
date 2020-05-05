const AWS = require('aws-sdk');

/**
 *
 * @param {object} params
 * @param {string} params.accessKeyId
 * @param {string} params.secretAccessKey
 * @param {string | undefined} [params.sessionToken]
 * @param {number | undefined} [params.expireTime]
 * @returns {AWS.Credentials}
 */
const makeCredentialsObject = ({
    accessKeyId,
    secretAccessKey,
    sessionToken,
    expireTime,
}) => {
    const credentials = new AWS.Credentials({
        accessKeyId,
        secretAccessKey,
        ...(sessionToken && { sessionToken }),
    });

    if (expireTime) {
        const expireDate = new Date(expireTime);
        const expired = expireDate.valueOf() <= Date.now();
        credentials.expireTime = expireDate;
        credentials.expired = expired;
    }

    return credentials;
};

module.exports = makeCredentialsObject;

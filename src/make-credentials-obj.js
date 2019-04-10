const AWS = require('aws-sdk');

const makeCredentialsObj = ({
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

module.exports = makeCredentialsObj;

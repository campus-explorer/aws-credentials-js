/*

Most of this code is ported from
node_modules/aws-sdk/lib/credentials/shared_ini_file_credentials.js.

*/
const AWS = require('aws-sdk');
const getProfileConfig = require('./profile-config');

const getRoleCredentials = async ({
    profile: roleProfile,
    duration,
    getMfaToken,
}) => {
    const {
        role_arn: roleArn,
        mfa_serial: mfaSerial,
        source_profile: sourceProfileName,
    } = getProfileConfig(roleProfile);

    if (!sourceProfileName) {
        throw AWS.util.error(
            new Error(`source_profile is not set using profile ${roleProfile}`),
            { code: 'SharedIniFileCredentialsProviderFailure' },
        );
    }

    if (typeof getProfileConfig(sourceProfileName) !== 'object') {
        throw AWS.util.error(
            new Error(
                `source_profile ${sourceProfileName} using profile ${roleProfile} does not exist`,
            ),
            { code: 'SharedIniFileCredentialsProviderFailure' },
        );
    }

    const sourceCredentials = new AWS.SharedIniFileCredentials(
        AWS.util.merge(this.options || {}, {
            profile: sourceProfileName,
            preferStaticCredentials: true,
        }),
    );

    const sts = new AWS.STS({
        credentials: sourceCredentials,
    });

    let mfaToken;
    if (mfaSerial) {
        const response = await getMfaToken(mfaSerial);
        mfaToken = response.token;
    }

    const roleParams = {
        RoleArn: roleArn,
        RoleSessionName: 'archer-serverless-' + Date.now(),
        DurationSeconds: duration,
        ...(mfaSerial && { SerialNumber: mfaSerial, TokenCode: mfaToken }),
    };

    const response = await sts.assumeRole(roleParams).promise();
    const {
        AccessKeyId: accessKeyId,
        SecretAccessKey: secretAccessKey,
        SessionToken: sessionToken,
        Expiration: expireTime,
    } = response.Credentials;

    return { accessKeyId, secretAccessKey, sessionToken, expireTime };
};

module.exports = getRoleCredentials;

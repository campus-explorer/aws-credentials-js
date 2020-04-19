/*

Most of this code is ported from
node_modules/aws-sdk/lib/credentials/shared_ini_file_credentials.js.

*/
const AWS = require('aws-sdk');
const { merge } = require('lodash');
const getProfileConfig = require('./profile-config');

/**
 * @typedef {{
 *     accessKeyId: string,
 *     secretAccessKey: string,
 *     sessionToken: string,
 *     expireTime: Date,
 * }} RoleCredentials
 */

/** @type {(params: {profile: string, duration?: number, getMfaToken: (mfaSerial: string) => Promise<{ token: string }>}) => Promise<RoleCredentials>} */
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
        throw new Error(
            `source_profile is not set using profile ${roleProfile}`,
        );
    }

    if (typeof getProfileConfig(sourceProfileName) !== 'object') {
        throw new TypeError(
            `source_profile ${sourceProfileName} using profile ${roleProfile} does not exist`,
        );
    }

    const sourceCredentials = new AWS.SharedIniFileCredentials(
        merge(
            {},
            {
                profile: sourceProfileName,
                preferStaticCredentials: true,
            },
        ),
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
    if (!response.Credentials) throw new Error('Failed to assume role');

    const {
        AccessKeyId: accessKeyId,
        SecretAccessKey: secretAccessKey,
        SessionToken: sessionToken,
        Expiration: expireTime,
    } = response.Credentials;

    return { accessKeyId, secretAccessKey, sessionToken, expireTime };
};

module.exports = getRoleCredentials;
